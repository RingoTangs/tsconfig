# @ringotangs/tsconfig

An opinionated, overridable TypeScript base configuration for RingoTangs projects. It defaults to modern bundler-based projects, but is not tied to Vite or any other build tool.

## Design

This package deliberately publishes one shared base configuration rather than separate browser, Vite, Node, or library presets. Projects extend the base and override the options required by their runtime and build process.

## Requirements

- TypeScript 5.8 or newer

## Installation

Install the configuration and TypeScript as development dependencies:

```sh
pnpm add -D @ringotangs/tsconfig typescript
```

## Usage

Extend the package from your project's `tsconfig.json` and define the files that belong to your project:

```json
{
  "extends": "@ringotangs/tsconfig",
  "include": ["src"]
}
```

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

Node projects can override module resolution and add the appropriate environment types. Projects that use `tsc` to produce output can override `noEmit` and related output options.

## License

[MIT](LICENSE)
