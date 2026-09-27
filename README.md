# @ringotangs/tsconfig

Shared TypeScript configuration for RingoTangs projects. The package currently provides one reusable base configuration.

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

## License

[MIT](LICENSE)
