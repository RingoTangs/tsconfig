import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { afterAll, beforeAll, expect, it } from 'vitest'

const repository = fileURLToPath(new URL('../', import.meta.url))
let temporaryDirectory

function writeJson(filename, value) {
  mkdirSync(dirname(filename), { recursive: true })
  writeFileSync(filename, JSON.stringify(value, null, 2))
}

function compile(directory) {
  const configFile = ts.readConfigFile(
    join(directory, 'tsconfig.json'),
    ts.sys.readFile,
  )
  expect(configFile.error).toBeUndefined()
  const config = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    directory,
  )
  const program = ts.createProgram(config.fileNames, config.options)
  const emit = program.emit()
  const diagnostics = [
    ...config.errors,
    ...ts.getPreEmitDiagnostics(program),
    ...emit.diagnostics,
  ]
  expect(
    diagnostics,
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => directory,
      getCanonicalFileName: (filename) => filename,
      getNewLine: () => '\n',
    }),
  ).toEqual([])
  return { options: config.options, emit }
}

beforeAll(() => {
  temporaryDirectory = mkdtempSync(join(tmpdir(), 'ringotangs-tsconfig-'))
  const output = execFileSync(
    'npm',
    [
      'pack',
      '--json',
      '--ignore-scripts',
      '--pack-destination',
      temporaryDirectory,
    ],
    { cwd: repository, encoding: 'utf8' },
  )
  const [packed] = JSON.parse(output)
  const files = packed.files.map((file) => file.path)
  expect(files).toContain('src/tsconfig.base.json')
  expect(files).toContain('src/tsconfig.nestjs.json')
  expect(files.some((file) => file.startsWith('test/'))).toBe(false)

  const packageDirectory = join(
    temporaryDirectory,
    'node_modules/@ringotangs/tsconfig',
  )
  mkdirSync(packageDirectory, { recursive: true })
  execFileSync('tar', [
    '-xzf',
    join(temporaryDirectory, packed.filename),
    '-C',
    packageDirectory,
    '--strip-components=1',
  ])
})

afterAll(() => {
  if (temporaryDirectory) {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

it('packed package exports both configurations', () => {
  const packageDirectory = join(
    temporaryDirectory,
    'node_modules/@ringotangs/tsconfig',
  )
  const manifest = JSON.parse(
    readFileSync(join(packageDirectory, 'package.json'), 'utf8'),
  )
  expect(manifest.exports['.']).toBe('./src/tsconfig.base.json')
  expect(manifest.exports['./nestjs']).toBe('./src/tsconfig.nestjs.json')
  for (const configuration of Object.values(manifest.exports)) {
    expect(existsSync(join(packageDirectory, configuration))).toBe(true)
  }
})

it('bundler consumer resolves the package and emits no files', () => {
  const directory = join(temporaryDirectory, 'bundler')
  writeJson(join(directory, 'tsconfig.json'), {
    extends: '@ringotangs/tsconfig',
    compilerOptions: { outDir: './dist' },
    include: ['index.ts'],
  })
  cpSync(
    join(repository, 'test/fixtures/bundler/index.ts'),
    join(directory, 'index.ts'),
  )
  const { options } = compile(directory)
  expect(options.module).toBe(ts.ModuleKind.ESNext)
  expect(options.moduleResolution).toBe(ts.ModuleResolutionKind.Bundler)
  expect(options.isolatedModules).toBe(true)
  expect(options.verbatimModuleSyntax).toBe(true)
  expect(options.erasableSyntaxOnly).toBe(true)
  expect(options.noEmit).toBe(true)
  expect(existsSync(join(directory, 'dist'))).toBe(false)
})

it.each(['module', 'commonjs'])(
  'nestjs %s consumer emits runnable code with dependency metadata',
  (mode) => {
    const directory = join(temporaryDirectory, mode)
    writeJson(join(directory, 'package.json'), { type: mode })
    writeJson(join(directory, 'tsconfig.json'), {
      extends: '@ringotangs/tsconfig/nestjs',
      compilerOptions: { rootDir: './src', outDir: './dist' },
      include: ['src'],
    })
    cpSync(join(repository, 'test/fixtures/nestjs'), join(directory, 'src'), {
      recursive: true,
      filter: (source) => basename(source) !== 'tsconfig.json',
    })
    const { options, emit } = compile(directory)
    expect(emit.emitSkipped).toBe(false)
    expect(options.noEmit).toBe(false)
    expect(options.module).toBe(ts.ModuleKind.NodeNext)
    expect(options.moduleResolution).toBe(ts.ModuleResolutionKind.NodeNext)
    expect(options.isolatedModules).toBe(true)
    expect(options.target).toBe(ts.ScriptTarget.ES2020)
    expect(options.lib).toEqual(['lib.es2020.d.ts'])
    expect(options.verbatimModuleSyntax).toBe(false)
    expect(options.erasableSyntaxOnly).toBe(false)
    const filename = join(directory, 'dist/consumer.js')
    const javascript = readFileSync(filename, 'utf8')
    expect(existsSync(join(directory, 'dist/service.js'))).toBe(true)
    expect(existsSync(`${filename}.map`)).toBe(true)
    expect(javascript).toMatch(/design:paramtypes/)
    if (mode === 'module') {
      expect(javascript).toMatch(/import .* from ['"]\.\/service\.js['"]/)
      expect(javascript).toMatch(/export/)
      expect(javascript).not.toMatch(/require\(/)
    } else {
      expect(javascript).toMatch(/require\(['"]\.\/service\.js['"]\)/)
      expect(javascript).toMatch(/exports\.Consumer/)
    }

    // Capture the emitted metadata without adding a reflection library dependency.
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '--eval',
        `
      import assert from 'node:assert/strict'
      const metadata = new WeakMap()
      Reflect.metadata = (key, value) => (target) => {
        if (key === 'design:paramtypes') metadata.set(target, value)
      }
      const { Consumer } = await import('./dist/consumer.js')
      const { Service } = await import('./dist/service.js')
      assert.deepEqual(metadata.get(Consumer), [Service])
      assert.equal(new Consumer(new Service()).getMessage(), 'ok')
    `,
      ],
      { cwd: directory, encoding: 'utf8' },
    )
  },
)
