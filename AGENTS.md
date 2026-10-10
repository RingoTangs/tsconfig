# Repository Guidelines

## Project Structure & Module Organization

This repository publishes a Bundler-first TypeScript base configuration as `@ringotangs/tsconfig` and a NestJS preset as `@ringotangs/tsconfig/nestjs`. The exports in `package.json` point to `src/tsconfig.base.json` and `src/tsconfig.nestjs.json`; the NestJS preset extends the base. Keep reusable compiler options in the base and let consumers override project-specific settings. Tooling configuration lives at the root: `eslint.config.mjs`, `.prettierrc`, `.editorconfig`, and `.prettierignore`. Editor recommendations and workspace defaults are under `.vscode/`. The `test/` directory contains the Vitest test entry; parallel consumer fixtures live under `test/fixtures/bundler/` and `test/fixtures/nestjs/`. Tests cover package resolution, ESM/CommonJS compilation, and decorator metadata.

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

Follow `.editorconfig` and `.prettierrc`: use two-space indentation, LF line endings, single quotes in JavaScript, no semicolons, and trailing commas where supported. Let Prettier handle layout and ESLint handle code-quality rules. Keep shared options in `src/tsconfig.base.json` and NestJS-specific overrides in `src/tsconfig.nestjs.json`; avoid duplicate inherited options and additional presets without a concrete need. Keep compiler-option comments concise and focused on practical behavior or tradeoffs.

## Testing Guidelines

Tests use Vitest and the existing TypeScript dependency; no coverage threshold is configured. Treat `pnpm check` as the required baseline. Keep Bundler and NestJS consumer fixtures in their respective directories under `test/fixtures/`, with test entries separate from fixture source. Keep fixtures focused on compiler behavior. Package tests must verify both published configurations and compile ESM/CommonJS consumers through the package name. Verify runtime decorator metadata and constructor parameter properties without requiring a full NestJS installation. Keep generated output outside the repository and clean up temporary directories even when tests fail.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style subjects such as `feat: add Prettier and ESLint configuration files` and `fix: update author field`. Use a short imperative subject with an appropriate type (`feat:`, `fix:`, `docs:`, or `chore:`), and keep each commit focused.

Pull requests should explain the motivation, list affected compiler options or tooling, and report validation performed. Link relevant issues when available. Screenshots are only useful for editor-facing changes; for configuration changes, include a small before/after example or TypeScript diagnostic instead.
