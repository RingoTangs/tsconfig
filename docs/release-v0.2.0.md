# v0.2.0

## English

Adds a NestJS preset and an explicit Bundler entry, with automated checks for package resolution, compilation, and decorator metadata. Requires TypeScript 5.8 or newer.

### Changes since v0.1.2

- Added `@ringotangs/tsconfig/nestjs` with NodeNext modules and resolution, supporting ESM and CommonJS.
- Enabled traditional decorators, decorator metadata, constructor parameter properties, JavaScript output, source maps, and CommonJS import interoperability in the NestJS preset.
- Set `strictPropertyInitialization: false` for NestJS DTOs and framework-assigned properties; other strict checks remain enabled.
- Split shared options into an internal base and separate Bundler and NestJS presets. All three configuration files are included in the npm package.
- Added `@ringotangs/tsconfig/bundler` as an explicit alias for the default entry.
- Enabled `isolatedModules: true` in both presets to check compatibility with single-file transpilation.
- Added Vitest tests for packed-package contents, all three public entries, ESM/CommonJS output, runtime `design:paramtypes` metadata, and constructor parameter properties. Included these tests in `pnpm check`.
- Organized Bundler and NestJS fixtures in parallel and added a NestJS fixture tsconfig for editor support and type checking.

### Upgrade notes

Existing `"extends": "@ringotangs/tsconfig"` configurations continue to use the Bundler preset. Its existing settings remain unchanged apart from the addition of `isolatedModules`, which may report new errors for code incompatible with single-file transpilation.

Both presets retain the ES2020 baseline. The NestJS preset does not set output directories, declaration output, or test framework types; configure these in your project.

### NestJS usage

```sh
pnpm add -D @ringotangs/tsconfig@0.2.0 typescript @types/node
```

```json
{
  "extends": "@ringotangs/tsconfig/nestjs",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```

For ordinary `.ts` files, use `"type": "module"` in your project's `package.json` for ESM, or `"type": "commonjs"` (or omit `type`) for CommonJS. Native Node.js ESM relative imports need the emitted extension, such as `import { Service } from './service.js'`.

## 简体中文

新增 NestJS 预设和显式 Bundler 入口，并增加包解析、编译及装饰器元数据的自动化检查。需要 TypeScript 5.8 或更高版本。

### 相比 v0.1.2 的变化

- 新增 `@ringotangs/tsconfig/nestjs`，使用 NodeNext 模块和解析策略，支持 ESM 与 CommonJS。
- NestJS 预设启用传统装饰器、装饰器元数据、构造函数参数属性、JavaScript 输出、源码映射及 CommonJS 导入互操作支持。
- NestJS 默认设置 `strictPropertyInitialization: false`，方便 DTO 和框架赋值的属性；其他严格检查继续开启。
- 将公共选项拆为内部基础配置，并提供独立的 Bundler 和 NestJS 预设。npm 包包含全部三份配置文件。
- 新增 `@ringotangs/tsconfig/bundler`，作为默认入口的显式别名。
- 两个预设均启用 `isolatedModules: true`，检查单文件转译兼容性。
- 增加 Vitest 测试，覆盖真实打包内容、三个公开入口、ESM/CommonJS 输出、运行时 `design:paramtypes` 元数据和构造函数参数属性，并接入 `pnpm check`。
- 将 Bundler 和 NestJS fixture 平级组织，为 NestJS fixture 增加 tsconfig，支持编辑器识别和类型检查。

### 升级说明

现有 `"extends": "@ringotangs/tsconfig"` 继续使用 Bundler 预设。除新增 `isolatedModules` 外，原有设置保持不变；不适合单文件转译的代码可能出现新的诊断。

两个预设继续使用 ES2020 基线。NestJS 预设不设置输出目录、声明文件输出或测试框架类型，这些选项由项目自行配置。

### NestJS 使用方法

```sh
pnpm add -D @ringotangs/tsconfig@0.2.0 typescript @types/node
```

```json
{
  "extends": "@ringotangs/tsconfig/nestjs",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```

对于普通 `.ts` 文件，在项目的 `package.json` 中设置 `"type": "module"` 使用 ESM，设置 `"type": "commonjs"` 或省略 `type` 使用 CommonJS。原生 Node.js ESM 的相对导入需要写明产物扩展名，例如 `import { Service } from './service.js'`。
