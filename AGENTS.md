# Repository Guidelines

## Project Structure & Module Organization

This repository publishes one shared TypeScript base configuration as `@ringotangs/tsconfig`. The package entry point in `package.json` exports `src/tsconfig.base.json`; keep reusable compiler options in that file and let consumers override environment-specific settings. Tooling configuration lives at the root: `eslint.config.mjs`, `.prettierrc`, `.editorconfig`, and `.prettierignore`. Editor recommendations and workspace defaults are under `.vscode/`. The `test/` directory contains a minimal consumer fixture that verifies package-level configuration resolution.

## Build, Test, and Development Commands

Use pnpm 10, matching the `packageManager` field and committed `pnpm-lock.yaml`.

- `pnpm install` installs the development toolchain.
- `pnpm lint` checks repository files with ESLint and the Antfu configuration.
- `pnpm format` verifies Prettier formatting without changing files.
- `pnpm typecheck` verifies that TypeScript can load the shared configuration through the package name.
- `pnpm check` runs lint, formatting, and type-checking checks; run it before opening a pull request.
- `pnpm check:fix` applies ESLint and Prettier fixes.

There is no build step: consumers load the single JSON base configuration directly through the package export.

## Coding Style & Naming Conventions

Follow `.editorconfig` and `.prettierrc`: use two-space indentation, LF line endings, single quotes in JavaScript, no semicolons, and trailing commas where supported. Let Prettier handle layout and ESLint handle code-quality rules. Keep the shared configuration at `src/tsconfig.base.json`; do not introduce environment-specific presets when consumers can override the base. Keep compiler-option comments concise and focused on practical behavior or tradeoffs.

## Testing Guidelines

No automated test framework or coverage threshold is configured. Treat `pnpm check` as the required baseline. Keep the fixture in `test/` focused on confirming that `@ringotangs/tsconfig` resolves and loads successfully. Add focused fixtures if a change introduces behavior that static linting cannot verify.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style subjects such as `feat: add Prettier and ESLint configuration files` and `fix: update author field`. Use a short imperative subject with an appropriate type (`feat:`, `fix:`, `docs:`, or `chore:`), and keep each commit focused.

Pull requests should explain the motivation, list affected compiler options or tooling, and report validation performed. Link relevant issues when available. Screenshots are only useful for editor-facing changes; for configuration changes, include a small before/after example or TypeScript diagnostic instead.
