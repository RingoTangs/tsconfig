# v0.3.0

## English

Adds React and Node.js presets, expands configuration tests, and improves the English and Chinese documentation. Requires TypeScript 5.8 or newer.

### Changes since v0.2.0

- Added `@ringotangs/tsconfig/react` for browser React projects. It extends the Bundler preset with `jsx: "react-jsx"`, DOM and DOM.Iterable types, and no file output by default.
- Added `@ringotangs/tsconfig/nodejs` with NodeNext modules and resolution for ESM and CommonJS. It defaults to type checking only and allows enums and constructor parameter properties.
- Updated NestJS to extend the Node.js preset, keeping its existing compiler behavior: traditional decorators, metadata, JavaScript output, source maps, and relaxed property initialization.
- Included all five configuration files in the npm package and added exports for the two new presets.
- Added React and Node.js fixtures, using real React and Node.js types. Expanded tests to cover all public entries, JSX and browser types, Node.js type checking, and optional ESM/CommonJS compilation and execution.
- Simplified the English README, added a Chinese README, and documented the new presets and their usage.

### Upgrade notes

The default entry, `/bundler`, and `/nestjs` retain their existing compiler behavior. All presets keep ES2020 as the default language baseline; the React preset adds browser library types.

Install the type packages your project needs. The configuration package does not install React, Node.js types, or framework dependencies for consumers.

The Node.js preset uses `noEmit: true`. To compile with `tsc`, override it with `"noEmit": false` and set an `outDir`. It does not configure native TypeScript execution in Node.js.

### React usage

In an existing browser React project:

```sh
pnpm add -D @ringotangs/tsconfig@0.3.0 typescript @types/react @types/react-dom
```

```json
{
  "extends": "@ringotangs/tsconfig/react",
  "include": ["src"]
}
```

Frameworks that handle JSX themselves can override `jsx` to `"preserve"`.

### Node.js usage

```sh
pnpm add -D @ringotangs/tsconfig@0.3.0 typescript @types/node
```

```json
{
  "extends": "@ringotangs/tsconfig/nodejs",
  "include": ["src"]
}
```

For ordinary `.ts` files, set `"type": "module"` in your project's `package.json` for ESM, or `"type": "commonjs"` (or omit `type`) for CommonJS. Native Node.js ESM relative imports need the emitted extension, such as `import { Service } from './service.js'`.

## 简体中文

新增 React 和 Node.js 预设，扩展配置测试，并完善中英文文档。需要 TypeScript 5.8 或更高版本。

### 相比 v0.2.0 的变化

- 新增 `@ringotangs/tsconfig/react`，面向浏览器 React 项目。在 Bundler 预设上添加 `jsx: "react-jsx"`、DOM 和 DOM.Iterable 类型，默认不生成文件。
- 新增 `@ringotangs/tsconfig/nodejs`，使用 NodeNext 模块和解析策略，支持 ESM 与 CommonJS。默认只检查类型，允许枚举和构造函数参数属性。
- NestJS 改为继承 Node.js 预设，保留原有编译行为：传统装饰器、元数据、JavaScript 输出、源码映射，以及放宽的属性初始化检查。
- npm 包包含全部五份配置文件，并新增两个预设的导出入口。
- 增加 React 和 Node.js fixture，使用真实的 React 和 Node.js 类型。扩展测试，覆盖全部公开入口、JSX 和浏览器类型、Node.js 类型检查，以及按需开启的 ESM/CommonJS 编译和运行。
- 精简英文 README，新增中文 README，并补充新预设的使用说明。

### 升级说明

默认入口、`/bundler` 和 `/nestjs` 保持原有编译行为。所有预设继续使用 ES2020 作为默认语言基线；React 预设额外提供浏览器标准库类型。

请按项目需要安装类型包。配置包不会为消费项目安装 React、Node.js 类型或框架依赖。

Node.js 预设默认设置 `noEmit: true`。需要使用 `tsc` 编译时，覆盖为 `"noEmit": false` 并设置 `outDir`。该预设不负责配置 Node.js 原生 TypeScript 执行。

### React 使用方法

在已有的浏览器 React 项目中安装：

```sh
pnpm add -D @ringotangs/tsconfig@0.3.0 typescript @types/react @types/react-dom
```

```json
{
  "extends": "@ringotangs/tsconfig/react",
  "include": ["src"]
}
```

由框架处理 JSX 时，可以将 `jsx` 覆盖为 `"preserve"`。

### Node.js 使用方法

```sh
pnpm add -D @ringotangs/tsconfig@0.3.0 typescript @types/node
```

```json
{
  "extends": "@ringotangs/tsconfig/nodejs",
  "include": ["src"]
}
```

对于普通 `.ts` 文件，在项目的 `package.json` 中设置 `"type": "module"` 使用 ESM，设置 `"type": "commonjs"` 或省略 `type` 使用 CommonJS。原生 Node.js ESM 的相对导入需要写明产物扩展名，例如 `import { Service } from './service.js'`。
