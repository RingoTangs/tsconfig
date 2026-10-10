# @ringotangs/tsconfig

[English](README.md) | [简体中文](README.zh-CN.md)

适用于 Bundler 和 NestJS 项目的共享 TypeScript 配置。需要 TypeScript 5.8 或更高版本。

| 入口                           | 用途                                                            |
| ------------------------------ | --------------------------------------------------------------- |
| `@ringotangs/tsconfig`         | 默认 Bundler 配置，适用于 Vite、Vue、React 和 TypeScript 工具库 |
| `@ringotangs/tsconfig/bundler` | 与默认配置相同，显式指定 Bundler 入口                           |
| `@ringotangs/tsconfig/nestjs`  | NestJS 配置，支持 NodeNext、传统装饰器和装饰器元数据            |

## Bundler

安装：

```sh
pnpm add -D @ringotangs/tsconfig typescript
```

创建 `tsconfig.json`：

```json
{
  "extends": "@ringotangs/tsconfig",
  "include": ["src"]
}
```

也可以使用 `"extends": "@ringotangs/tsconfig/bundler"`。两个入口都只检查类型，不生成文件；JavaScript 输出由构建工具负责。

两个预设的 `target` 和 `lib` 默认均为 ES2020，可按项目需要覆盖。浏览器项目可以添加 `"lib": ["ES2020", "DOM", "DOM.Iterable"]`；JSX 和框架专属选项也由项目自行配置。

## NestJS

在 NestJS 项目中安装配置、TypeScript 和 Node.js 类型：

```sh
pnpm add -D @ringotangs/tsconfig typescript @types/node
```

创建 `tsconfig.json`：

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

该预设启用 JavaScript 和源码映射输出。输出目录和测试框架类型需要自行配置。

### ESM 和 CommonJS

NodeNext 根据项目的 `package.json` 判断普通 `.ts` 文件的模块格式：

- `"type": "module"`：ESM。
- `"type": "commonjs"` 或未设置 `type`：CommonJS。

原生 Node.js ESM 要求相对导入包含输出文件的扩展名，通常是 `.js`，即使在 TypeScript 源码中也需要写明：

```ts
import { UsersService } from './users.service.js'
```

TypeScript 会将该路径解析到 `users.service.ts`，并在输出中保留 `.js`。运行产物时应保留匹配的包模块类型。显式使用 `.mts` 和 `.cts` 文件时，分别采用 ESM 和 CommonJS；导入 `.mts` 文件时使用产物的 `.mjs` 扩展名。

### 属性初始化

NestJS 默认设置 `strictPropertyInitialization: false`，因为 DTO 和注入属性可能由框架赋值，而非在构造函数中初始化。其他严格检查仍然开启，但这不保证属性在运行时一定有值。

如需检查属性初始化，在项目配置中添加 `strictPropertyInitialization: true`：

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

## 关键选项

| 选项                   | 作用                                                                       | Bundler | NestJS  |
| ---------------------- | -------------------------------------------------------------------------- | ------- | ------- |
| `isolatedModules`      | 检查是否使用了 esbuild、SWC、Babel 等工具无法安全逐文件编译的代码。        | `true`  | `true`  |
| `verbatimModuleSyntax` | 开启后保留未标记 `type` 的导入导出，不将其转换为 CommonJS。                | `true`  | `false` |
| `erasableSyntaxOnly`   | 禁止需要生成额外运行时代码的 TypeScript 特性，例如枚举和构造函数参数属性。 | `true`  | `false` |

Bundler 项目中，导入类型时使用类型专用导入。NestJS 允许 CommonJS 转换和构造函数参数属性；参与运行时元数据的服务类和 DTO 类应保留普通导入。

`isolatedModules` 不会为其他编译器开启装饰器元数据。如果使用 SWC 等编译器构建 NestJS，需要单独配置装饰器和元数据支持。

## 仓库检查

- `pnpm check`：运行 Lint、格式检查、类型检查和 Vitest 测试。
- `pnpm pack:check`：预览 npm 包内容，不生成压缩包。

## 许可证

[MIT](LICENSE)
