# Repository Guidelines

## Project Structure & Module Organization

This repository publishes a Bundler preset as `@ringotangs/tsconfig` (also available as `@ringotangs/tsconfig/bundler`) a React preset as `@ringotangs/tsconfig/react`, a Node.js preset as `@ringotangs/tsconfig/nodejs`, and a NestJS preset as `@ringotangs/tsconfig/nestjs`. The exports in `package.json` point to their corresponding JSON presets in `src/`. React extends Bundler; NestJS extends Node.js. Node.js defaults to type checking only, while NestJS enables output, source maps, and traditional decorator metadata. Bundler and Node.js extend the internal `src/tsconfig.base.json`, which is published for inheritance but has no public entry. Keep reusable compiler options in the base and let consumers override project-specific settings. Tooling configuration lives at the root: `eslint.config.mjs`, `.prettierrc`, `.editorconfig`, and `.prettierignore`. Editor recommendations and workspace defaults are under `.vscode/`. The `test/` directory contains the Vitest test entry; parallel Bundler, React, Node.js, and NestJS consumer fixtures live under `test/fixtures/`. Tests cover package resolution, ESM/CommonJS compilation, and decorator metadata.

## Build, Test, and Development Commands

Use pnpm 10, matching the `packageManager` field and committed `pnpm-lock.yaml`.

- `pnpm install` installs the development toolchain.
- `pnpm lint` checks repository files with ESLint and the Antfu configuration.
- `pnpm format` verifies Prettier formatting without changing files.
- `pnpm typecheck` verifies that TypeScript can load the shared configuration through the package name.
- `pnpm test` runs Vitest tests against the packed package and temporary consumers.
- `pnpm check` runs lint, formatting, type-checking, and automated tests; run it before opening a pull request.
- `pnpm check:fix` applies ESLint and Prettier fixes.
- `pnpm pack:check` previews the npm package file list.

There is no package build step: consumers load the JSON configurations directly through package exports. Tests compile fixtures into temporary directories and remove their output and tarballs after completion.

## Coding Style & Naming Conventions

Follow `.editorconfig` and `.prettierrc`: use two-space indentation, LF line endings, single quotes in JavaScript, no semicolons, and trailing commas where supported. Let Prettier handle layout and ESLint handle code-quality rules. Keep shared options in `src/tsconfig.base.json`, Bundler-specific settings in `src/tsconfig.bundler.json`, React settings in `src/tsconfig.react.json`, Node.js settings in `src/tsconfig.nodejs.json`, and NestJS settings in `src/tsconfig.nestjs.json`; avoid duplicate inherited options and additional presets without a concrete need. Keep compiler-option comments concise and focused on practical behavior or tradeoffs.

## Testing Guidelines

Tests use Vitest and the existing TypeScript dependency; no coverage threshold is configured. Treat `pnpm check` as the required baseline. Keep Bundler, React, Node.js, and NestJS consumer fixtures in their respective directories under `test/fixtures/`, with test entries separate from fixture source. Keep fixtures focused on compiler behavior. Package tests must verify all five published configuration files, the equivalent default and Bundler entries, all React, Node.js, and NestJS entries, and compile ESM/CommonJS consumers through the package name. Use installed React and Node.js types rather than mock declarations. Verify React JSX and browser types, Node.js type checking and optional compilation, and runtime decorator metadata and constructor parameter properties without requiring a full NestJS installation. Keep generated output outside the repository and clean up temporary directories even when tests fail.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style subjects such as `feat: add Prettier and ESLint configuration files` and `fix: update author field`. Use a short imperative subject with an appropriate type (`feat:`, `fix:`, `docs:`, or `chore:`), and keep each commit focused.

Pull requests should explain the motivation, list affected compiler options or tooling, and report validation performed. Link relevant issues when available. Screenshots are only useful for editor-facing changes; for configuration changes, include a small before/after example or TypeScript diagnostic instead.
