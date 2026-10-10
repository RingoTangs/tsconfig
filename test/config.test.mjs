import assert from 'node:assert/strict'
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
import { dirname, join } from 'node:path'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

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
  assert.equal(configFile.error, undefined)
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
  assert.equal(
    diagnostics.length,
    0,
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => directory,
      getCanonicalFileName: (filename) => filename,
      getNewLine: () => '\n',
    }),
  )
  return { options: config.options, emit }
}

before(() => {
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
  assert.ok(files.includes('src/tsconfig.base.json'))
  assert.ok(files.includes('src/tsconfig.nestjs.json'))
  assert.ok(!files.some((file) => file.startsWith('test/')))

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

after(() => {
  if (temporaryDirectory) {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
})

test('packed package exports both configurations', () => {
  const packageDirectory = join(
    temporaryDirectory,
    'node_modules/@ringotangs/tsconfig',
  )
  const manifest = JSON.parse(
    readFileSync(join(packageDirectory, 'package.json'), 'utf8'),
  )
  assert.equal(manifest.exports['.'], './src/tsconfig.base.json')
  assert.equal(manifest.exports['./nestjs'], './src/tsconfig.nestjs.json')
  for (const configuration of Object.values(manifest.exports)) {
    assert.ok(existsSync(join(packageDirectory, configuration)))
  }
})

test('Bundler consumer resolves the package and emits no files', () => {
  const directory = join(temporaryDirectory, 'bundler')
  writeJson(join(directory, 'tsconfig.json'), {
    extends: '@ringotangs/tsconfig',
    compilerOptions: { outDir: './dist' },
    include: ['index.ts'],
  })
  cpSync(join(repository, 'test/index.ts'), join(directory, 'index.ts'))
  const { options } = compile(directory)
  assert.equal(options.module, ts.ModuleKind.ESNext)
  assert.equal(options.moduleResolution, ts.ModuleResolutionKind.Bundler)
  assert.equal(options.isolatedModules, true)
  assert.equal(options.verbatimModuleSyntax, true)
  assert.equal(options.erasableSyntaxOnly, true)
  assert.equal(options.noEmit, true)
  assert.ok(!existsSync(join(directory, 'dist')))
})

for (const mode of ['module', 'commonjs']) {
  test(`NestJS ${mode} consumer emits runnable code with dependency metadata`, () => {
    const directory = join(temporaryDirectory, mode)
    writeJson(join(directory, 'package.json'), { type: mode })
    writeJson(join(directory, 'tsconfig.json'), {
      extends: '@ringotangs/tsconfig/nestjs',
      compilerOptions: { rootDir: './src', outDir: './dist' },
      include: ['src'],
    })
    cpSync(join(repository, 'test/fixtures/nestjs'), join(directory, 'src'), {
      recursive: true,
    })
    const { options, emit } = compile(directory)
    assert.equal(emit.emitSkipped, false)
    assert.equal(options.noEmit, false)
    assert.equal(options.module, ts.ModuleKind.NodeNext)
    assert.equal(options.moduleResolution, ts.ModuleResolutionKind.NodeNext)
    assert.equal(options.isolatedModules, true)
    assert.equal(options.target, ts.ScriptTarget.ES2020)
    assert.deepEqual(options.lib, ['lib.es2020.d.ts'])
    assert.equal(options.verbatimModuleSyntax, false)
    assert.equal(options.erasableSyntaxOnly, false)
    const filename = join(directory, 'dist/consumer.js')
    const javascript = readFileSync(filename, 'utf8')
    assert.ok(existsSync(join(directory, 'dist/service.js')))
    assert.ok(existsSync(`${filename}.map`))
    assert.match(javascript, /design:paramtypes/)
    if (mode === 'module') {
      assert.match(javascript, /import .* from ['"]\.\/service\.js['"]/)
      assert.match(javascript, /export/)
      assert.doesNotMatch(javascript, /require\(/)
    } else {
      assert.match(javascript, /require\(['"]\.\/service\.js['"]\)/)
      assert.match(javascript, /exports\.Consumer/)
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
  })
}
