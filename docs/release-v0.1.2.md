# v0.1.2

## English

Shared TypeScript configuration for modern Bundler projects, including Vite, Vue, React, and TypeScript libraries. Requires TypeScript 5.8 or newer.

### Highlights

- ES2020 language and library baseline, with ESNext modules and Bundler module resolution.
- Type checking without emitting files; JavaScript output stays with your build tool.
- Strict type checking, unused variable and parameter checks, and switch fallthrough checks.
- `verbatimModuleSyntax: true` for explicit type-only imports and preserved value imports.
- `erasableSyntaxOnly: true` to reject TypeScript features that require extra runtime code, such as enums and constructor parameter properties.
- ESLint, Prettier, a consumer type-check fixture, GitHub Actions CI, and an npm publishing workflow with prepublish checks and a package dry run.

### Usage

```sh
pnpm add -D @ringotangs/tsconfig@0.1.2 typescript
```

```json
{
  "extends": "@ringotangs/tsconfig",
  "include": ["src"]
}
```

Override compiler options for your runtime and build process. Browser projects can add DOM library types; Node.js projects need suitable module settings and Node.js types.

## 简体中文

适用于 Vite、Vue、React 和 TypeScript 工具库等现代 Bundler 项目的共享 TypeScript 配置。需要 TypeScript 5.8 或更高版本。

### 主要功能

- 以 ES2020 作为语言和标准库基线，使用 ESNext 模块及 Bundler 模块解析。
- 只检查类型，不生成文件；JavaScript 输出由构建工具负责。
- 开启严格类型检查、未使用变量和参数检查，以及 switch 分支贯穿检查。
- 启用 `verbatimModuleSyntax: true`，使用显式类型专用导入，并保留值导入。
- 启用 `erasableSyntaxOnly: true`，禁止需要生成额外运行时代码的 TypeScript 特性，例如枚举和构造函数参数属性。
- 提供 ESLint、Prettier、消费项目类型检查 fixture、GitHub Actions CI，以及包含发布前检查和打包预检的 npm 发布工作流。

### 使用方法

```sh
pnpm add -D @ringotangs/tsconfig@0.1.2 typescript
```

```json
{
  "extends": "@ringotangs/tsconfig",
  "include": ["src"]
}
```

可按运行环境和构建流程覆盖编译选项。浏览器项目可补充 DOM 类型；Node.js 项目需配置合适的模块选项和 Node.js 类型。
