# @ringotangs/tsconfig

Opinionated, overridable TypeScript configurations for RingoTangs projects: a Bundler preset and a NestJS preset for Node.js, sharing a common base.

## Design

| Entry                          | Intended use                                      | Module handling                    | Output                     |
| ------------------------------ | ------------------------------------------------- | ---------------------------------- | -------------------------- |
| `@ringotangs/tsconfig`         | Vite, Vue, React, and modern TypeScript libraries | `ESNext` with `bundler` resolution | Type checking only         |
| `@ringotangs/tsconfig/bundler` | Explicit alias for the default Bundler preset     | `ESNext` with `bundler` resolution | Type checking only         |
| `@ringotangs/tsconfig/nestjs`  | NestJS applications                               | `NodeNext` modules and resolution  | JavaScript and source maps |

Both presets extend the internal `src/tsconfig.base.json`, which holds ES2020 settings, strict checks, class field semantics, module detection, and single-file transpilation checks. The base is included in the package for inheritance but has no public entry. The default entry continues to load the Bundler preset, preserving existing consumer behavior.

The NestJS preset enables traditional decorators, decorator metadata, and constructor parameter properties. It disables strict property initialization for DTOs and framework-assigned properties while retaining other strict checks.

Both configurations use ES2020 as the default `target` and `lib`. Consumers can override them to match their runtime. The library settings provide types, not runtime APIs or polyfills.

## Requirements

- TypeScript 5.8 or newer

## Installation

Install the configuration and TypeScript as development dependencies:

```sh
pnpm add -D @ringotangs/tsconfig typescript
```

## Bundler usage

Extend the package from your project's `tsconfig.json` and define the files that belong to your project:

```json
{
  "extends": "@ringotangs/tsconfig",
  "include": ["src"]
}
```

For an explicit Bundler entry, use `"extends": "@ringotangs/tsconfig/bundler"`; it is equivalent to the default entry.

Project-specific compiler options can be added under `compilerOptions` when needed. They override the corresponding shared settings.

For example, a browser project can add DOM library types:

```json
{
  "extends": "@ringotangs/tsconfig",
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
```

Configure JSX and framework-specific settings in the consuming project as needed.

## NestJS usage

Install Node.js types alongside the configuration and TypeScript:

```sh
pnpm add -D @ringotangs/tsconfig typescript @types/node
```

Extend the NestJS entry and specify your project's source and output directories:

```json
{
  "extends": "@ringotangs/tsconfig/nestjs",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```

The preset does not set `rootDir`, `outDir`, path aliases, declaration output, incremental compilation, or test framework types. Configure these in the consuming project. If you use Jest or Vitest globals, configure their types in your test configuration. The preset does not restrict automatically included `@types` packages with a `types` list.

### ESM

Set `"type": "module"` in the consuming project's `package.json`. With NodeNext, ordinary `.ts` files then compile to ESM; `.mts` files are always ESM and emit `.mjs`.

Native Node.js ESM requires extensions on relative imports. In TypeScript source, reference the emitted filename:

```ts
import { UsersService } from './users.service.js'
```

TypeScript resolves that import to the `.ts` source and preserves `.js` in the output. For `.mts` sources, use `.mjs` instead. The generated output must run within the corresponding package module scope.

### CommonJS

Set `"type": "commonjs"` in the consuming project's `package.json` (or omit `type`). Ordinary `.ts` files then compile to CommonJS; `.cts` files are always CommonJS and emit `.cjs`. Use the same NestJS configuration shown above; overriding `module` is unnecessary.

The preset's `verbatimModuleSyntax: false` allows TypeScript to convert ES import/export syntax into `require` and `exports` for CommonJS files.

## Transpilation and imports

Both entries enable `isolatedModules` to check compatibility with single-file transpilation used by esbuild, SWC, and Babel. This option does not select a transpiler or guarantee that a transpiler emits decorator metadata. NestJS builds using another compiler must configure its traditional decorator and metadata support separately.

The Bundler preset enables `verbatimModuleSyntax`: imports and exports marked with `type` are erased, while value imports are preserved and ES module syntax is not converted to CommonJS. Use explicit type-only imports for interfaces and other types.

The NestJS preset disables `verbatimModuleSyntax` to allow module conversion and TypeScript's type-based import elision. Services and DTO classes used in dependency injection or validation metadata need ordinary value imports, not `import type`. Interfaces have no runtime constructor; use explicit injection tokens when injecting interface-typed dependencies.

The Bundler preset also enables `erasableSyntaxOnly`, disallowing constructs that require TypeScript-specific runtime transformations, such as enums and constructor parameter properties. The NestJS preset explicitly disables this setting so code such as `constructor(private readonly service: UsersService)` can compile.

## Validation

`pnpm check` runs linting, formatting, Bundler and NestJS fixture type checks, and Vitest tests. Consumer fixtures are organized in parallel under `test/fixtures/bundler/` and `test/fixtures/nestjs/`, with the Vitest entry at `test/config.test.mjs`. The tests pack the actual npm package, resolve the default, Bundler, and NestJS entries from temporary consumer projects, and compile and execute NestJS-style ESM/CommonJS fixtures to verify decorator metadata and parameter properties. They do not start a NestJS server. Build output and tarballs stay in temporary directories and are cleaned up after testing.

`pnpm pack:check` also previews the published file list without creating a tarball in the repository.

## License

[MIT](LICENSE)
