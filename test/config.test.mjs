import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { afterAll, beforeAll, expect, it } from 'vitest'

const repository = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
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
  expect(files).toContain('src/tsconfig.bundler.json')
  expect(files).toContain('src/tsconfig.nestjs.json')
  expect(files).toContain('src/tsconfig.react.json')
  expect(files).toContain('src/tsconfig.nodejs.json')
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
  const typesDirectory = join(temporaryDirectory, 'node_modules/@types')
  mkdirSync(typesDirectory, { recursive: true })
  for (const name of ['react', 'node']) {
    symlinkSync(
      dirname(realpathSync(require.resolve(`@types/${name}/package.json`))),
      join(typesDirectory, name),
      'dir',
    )
  }
})

afterAll(() => {
  if (temporaryDirectory) {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

it('packed package exports all presets with their shared base', () => {
  const packageDirectory = join(
    temporaryDirectory,
    'node_modules/@ringotangs/tsconfig',
  )
  const manifest = JSON.parse(
    readFileSync(join(packageDirectory, 'package.json'), 'utf8'),
  )
  expect(manifest.tsconfig).toBe('./src/tsconfig.bundler.json')
  expect(manifest.exports['.']).toBe('./src/tsconfig.bundler.json')
  expect(manifest.exports['./bundler']).toBe('./src/tsconfig.bundler.json')
  expect(manifest.exports['./nestjs']).toBe('./src/tsconfig.nestjs.json')
  expect(manifest.exports['./react']).toBe('./src/tsconfig.react.json')
  expect(manifest.exports['./nodejs']).toBe('./src/tsconfig.nodejs.json')
  for (const configuration of Object.values(manifest.exports)) {
    expect(existsSync(join(packageDirectory, configuration))).toBe(true)
  }
})

it.each(['@ringotangs/tsconfig', '@ringotangs/tsconfig/bundler'])(
  'bundler consumer resolves %s and emits no files',
  (entry) => {
    const directory = join(
      temporaryDirectory,
      entry.endsWith('/bundler') ? 'bundler-explicit' : 'bundler-default',
    )
    writeJson(join(directory, 'tsconfig.json'), {
      extends: entry,
      compilerOptions: { outDir: './dist' },
      include: ['index.ts'],
    })
    cpSync(
      join(repository, 'test/fixtures/bundler/index.ts'),
      join(directory, 'index.ts'),
    )
    const { options } = compile(directory)
    const equivalent = ts.parseJsonConfigFileContent(
      {
        extends: entry.endsWith('/bundler')
          ? '@ringotangs/tsconfig'
          : '@ringotangs/tsconfig/bundler',
        compilerOptions: { outDir: './dist' },
        include: ['index.ts'],
      },
      ts.sys,
      directory,
    )
    expect(equivalent.errors).toEqual([])
    expect(options).toEqual(equivalent.options)
    expect(options.module).toBe(ts.ModuleKind.ESNext)
    expect(options.moduleResolution).toBe(ts.ModuleResolutionKind.Bundler)
    expect(options.isolatedModules).toBe(true)
    expect(options.verbatimModuleSyntax).toBe(true)
    expect(options.erasableSyntaxOnly).toBe(true)
    expect(options.noEmit).toBe(true)
    expect(existsSync(join(directory, 'dist'))).toBe(false)
  },
)

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

it('react consumer checks JSX and browser types without output', () => {
  const directory = join(temporaryDirectory, 'react')
  writeJson(join(directory, 'tsconfig.json'), {
    extends: '@ringotangs/tsconfig/react',
    compilerOptions: { outDir: './dist' },
    include: ['src'],
  })
  cpSync(join(repository, 'test/fixtures/react'), join(directory, 'src'), {
    recursive: true,
    filter: (source) => basename(source) !== 'tsconfig.json',
  })
  const { options } = compile(directory)
  expect(options.jsx).toBe(ts.JsxEmit.ReactJSX)
  expect(options.lib).toEqual([
    'lib.es2020.d.ts',
    'lib.dom.d.ts',
    'lib.dom.iterable.d.ts',
  ])
  expect(options.moduleResolution).toBe(ts.ModuleResolutionKind.Bundler)
  expect(options.noEmit).toBe(true)
  expect(existsSync(join(directory, 'dist'))).toBe(false)
})

it.each(['module', 'commonjs'])(
  'nodejs %s consumer checks types and supports optional compilation',
  (mode) => {
    const directory = join(temporaryDirectory, `nodejs-${mode}`)
    writeJson(join(directory, 'package.json'), { type: mode })
    const config = {
      extends: '@ringotangs/tsconfig/nodejs',
      compilerOptions: { rootDir: './src', outDir: './dist' },
      include: ['src'],
    }
    writeJson(join(directory, 'tsconfig.json'), config)
    cpSync(join(repository, 'test/fixtures/nodejs'), join(directory, 'src'), {
      recursive: true,
      filter: (source) => basename(source) !== 'tsconfig.json',
    })
    const { options } = compile(directory)
    expect(options.noEmit).toBe(true)
    expect(options.module).toBe(ts.ModuleKind.NodeNext)
    expect(options.moduleResolution).toBe(ts.ModuleResolutionKind.NodeNext)
    expect(options.lib).toEqual(['lib.es2020.d.ts'])
    expect(options.experimentalDecorators).toBeUndefined()
    expect(existsSync(join(directory, 'dist'))).toBe(false)
    config.compilerOptions.noEmit = false
    writeJson(join(directory, 'tsconfig.json'), config)
    const { emit } = compile(directory)
    expect(emit.emitSkipped).toBe(false)
    const javascript = readFileSync(join(directory, 'dist/index.js'), 'utf8')
    expect(javascript).toMatch(
      mode === 'module'
        ? /import .* from ['"]node:path['"]/
        : /require\(['"]node:path['"]\)/,
    )
    execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '--eval',
        `
      import assert from 'node:assert/strict'
      const { result, runtime, buffer } = await import('./dist/index.js')
      assert.equal(result, 'example.txt:ready')
      assert.equal(runtime, process.version)
      assert.equal(buffer, 'ok')
    `,
      ],
      { cwd: directory, encoding: 'utf8' },
    )
  },
)
