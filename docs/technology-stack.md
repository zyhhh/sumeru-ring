# SUMERU RING 技术选型

## 目标

SUMERU RING 是一个纯前端个人工作台。首期提供五类开发工具，后续可以继续加入工具、网址或其他资源。项目需要本地可运行、可构建为静态文件，并能直接部署到云服务器的 Nginx。

## 核心技术

| 技术 | 用途 | 选择原因 |
| --- | --- | --- |
| Vue 3 | 页面与组件框架 | Composition API 组织逻辑清晰，模板语法对后端开发者直观 |
| TypeScript | 静态类型 | 提前发现字段和调用错误，也是工具注册协议可扩展的基础 |
| Vite | 开发与构建 | 启动快、配置少，生产构建直接输出静态文件 |
| Vue Router | 页面路由 | 每个工具有独立地址，方便收藏、刷新和未来扩展 |
| Pinia | 全局状态 | 管理主题、侧栏状态、收藏与最近使用等跨页面数据 |
| Element Plus | 基础交互组件 | 中文文档成熟，表单、上传、提示等组件完整 |
| SCSS + CSS Variables | 样式系统 | CSS Variables 管理主题令牌，SCSS 组织组件样式 |
| Lucide Vue Next | 图标 | 图标风格统一，避免手工维护 SVG |

## 功能依赖

- `jose`：JWT 解码与 HMAC 签名验证。
- `qr-code-styling`：生成带颜色、样式与中心 Logo 的二维码。
- `@zxing/browser`：从用户上传的图片中识别二维码，不调用摄像头。
- 浏览器原生 `JSON.parse`、`JSON.stringify` 与 Web Worker：处理 1-10 MB JSON，避免主线程卡顿。
- `@guolao/vue-monaco-editor`：大 JSON 代码展示、搜索与编辑体验；Monaco 按需加载。

## 工程质量

- `Vitest`：测试字符分类、URL 转换、JSON 转义和 JWT 辅助逻辑等纯函数。
- `Vue Test Utils`：需要时测试 Vue 组件交互。
- `ESLint`：检查潜在代码错误。
- `Prettier`：统一格式，降低无意义的代码风格差异。
- `vue-tsc`：执行 Vue 模板和 TypeScript 类型检查。

## 未选择的方案

- Naive UI：组件完善，但默认视觉特征较强，不利于当前自定义的新极简主义风格。
- Tailwind CSS + Radix Vue：自由度高，但会增加基础组件组合和维护成本。
- Nuxt / SSR：当前本地使用且不要求 SEO，服务端渲染会引入不必要复杂度。
- 后端服务：所有首期功能均可在浏览器本地完成，敏感数据不需要上传。

## 部署形态

运行 `npm run build` 后生成 `dist/`。该目录是纯静态资源，可以部署到 Nginx、对象存储或静态托管平台。Vue Router 使用 history 模式时，Nginx 需要将未知路径回退到 `index.html`，项目提供示例配置。

