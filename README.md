# @ringotangs/tsconfig

[English](README.md) | [简体中文](README.zh-CN.md)

Shared TypeScript configurations for Bundler, React, Node.js, and NestJS projects. Requires TypeScript 5.8 or newer.

| Entry                          | Use                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `@ringotangs/tsconfig`         | Default Bundler configuration for Vite, Vue, React, and TypeScript libraries       |
| `@ringotangs/tsconfig/bundler` | Same configuration, with an explicit Bundler entry                                 |
| `@ringotangs/tsconfig/react`   | Browser React projects with automatic JSX runtime and DOM types                    |
| `@ringotangs/tsconfig/nodejs`  | NodeNext ESM/CommonJS, with type checking only by default                          |
| `@ringotangs/tsconfig/nestjs`  | NestJS configuration with NodeNext, traditional decorators, and decorator metadata |

## Bundler

Install:

```sh
pnpm add -D @ringotangs/tsconfig typescript
```

Create `tsconfig.json`:

```json
{
  "extends": "@ringotangs/tsconfig",
  "include": ["src"]
}
```

You can also use `"extends": "@ringotangs/tsconfig/bundler"`. Both Bundler entries check types without emitting files; your build tool handles JavaScript output.

All presets default to ES2020 for `target` and `lib`. Override compiler options to match your project. Browser projects can add `"lib": ["ES2020", "DOM", "DOM.Iterable"]`; configure JSX and framework-specific options as needed.

## React

For browser React projects using a Bundler, install React types alongside your existing React dependencies:

```sh
pnpm add -D @ringotangs/tsconfig typescript @types/react @types/react-dom
```

```json
{
  "extends": "@ringotangs/tsconfig/react",
  "include": ["src"]
}
```

This preset adds DOM types and `jsx: "react-jsx"` to the Bundler settings. It checks types without emitting files. Frameworks that handle JSX themselves can override `jsx` to `"preserve"`; Vite and test framework types remain project settings.

## Node.js

```sh
pnpm add -D @ringotangs/tsconfig typescript @types/node
```

```json
{
  "extends": "@ringotangs/tsconfig/nodejs",
  "include": ["src"]
}
```

Node.js uses NodeNext and defaults to type checking only. To compile with `tsc`, set `"noEmit": false` and an `outDir` in `compilerOptions`. Output directories, source maps, declaration files, and test types are project settings. This preset does not configure native TypeScript execution in Node.js.

## NestJS

Install the configuration, TypeScript, and Node.js types in your NestJS project:

```sh
pnpm add -D @ringotangs/tsconfig typescript @types/node
```

Create `tsconfig.json`:

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

This preset enables JavaScript and source map output. Set your own output directory and configure test framework types separately.

### ESM and CommonJS

Both Node.js and NestJS use NodeNext. NodeNext uses your project's `package.json` to determine the module format for ordinary `.ts` files:

- `"type": "module"`: ESM.
- `"type": "commonjs"` or no `type` field: CommonJS.

For native Node.js ESM, relative imports need the output file's extension, usually `.js`, even in TypeScript source:

```ts
import { UsersService } from './users.service.js'
```

TypeScript resolves this to `users.service.ts` and keeps `.js` in the output. Keep the matching package module type when running the output. Explicit `.mts` and `.cts` files use ESM and CommonJS respectively; `.mts` imports use the emitted `.mjs` extension.

### Property initialization

NestJS defaults to `strictPropertyInitialization: false` because DTO and injected properties may be assigned by the framework rather than the constructor. Other strict checks remain enabled. This does not guarantee that a property has a value at runtime.

To require property initialization, add `strictPropertyInitialization: true` to your project's configuration:

```json
{
  "extends": "@ringotangs/tsconfig/nestjs",
  "compilerOptions": {
    "outDir": "./dist",
    "strictPropertyInitialization": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```

## Key options

| Option                 | Purpose                                                                                                       | Bundler / React | Node.js / NestJS |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- | --------------- | ---------------- |
| `isolatedModules`      | Checks for code that tools such as esbuild, SWC, or Babel cannot safely compile one file at a time.           | `true`          | `true`           |
| `verbatimModuleSyntax` | When enabled, preserves imports and exports without a `type` modifier and prevents conversion to CommonJS.    | `true`          | `false`          |
| `erasableSyntaxOnly`   | Rejects TypeScript features that need extra runtime code, such as enums and constructor parameter properties. | `true`          | `false`          |

Use type-only imports for types in Bundler and React projects. NestJS allows CommonJS conversion and constructor parameter properties; keep ordinary imports for service and DTO classes used in runtime metadata.

`isolatedModules` does not enable decorator metadata in other compilers. If you build NestJS with SWC or another compiler, configure its decorator and metadata support separately.

## Repository checks

- `pnpm check`: runs linting, formatting checks, type checks, and Vitest tests.
- `pnpm pack:check`: previews the npm package contents without creating a tarball.

## License

[MIT](LICENSE)
