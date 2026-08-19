# 新增工具指南

本文面向不熟悉前端工程的维护者。

## 1. 创建功能目录

在 `src/features/` 下创建独立目录，例如 `text-diff/`。页面放入 `views/`，不依赖 Vue 的算法放入 `lib/`。

## 2. 注册工具

在 `src/registry/contentRegistry.ts` 添加一条工具定义，包括页面的动态 `loader`。首页概览、小工具完整列表、全局搜索和工具路由会从该定义自动派生，不需要分别维护卡片或路由。

网址导航属于运行时数据，不写入工具注册表。默认网址维护在 `src/features/links/defaultLinks.ts`，用户新增和修改的数据通过 `linkRepository.ts` 保存到 IndexedDB。新增网址相关能力时，页面应调用仓库函数，不要直接操作 `indexedDB`。

## 3. 声明工具页面加载器

在工具定义中使用动态 `import()` 声明页面。动态加载可以避免用户打开首页时下载所有工具代码。路由名称和侧栏元信息由内容目录统一生成，不要在 `src/router/index.ts` 重复添加工具路由。

```ts
{
  id: 'text-diff',
  route: '/tools/text-diff',
  loader: () => import('@/features/text-diff/views/TextDiffToolView.vue'),
  // 其余标题、描述、分类、标签和图标字段省略
}
```

页面路由约定：

| 路由 | 用途 |
| --- | --- |
| `/` | 各内容类型概览 |
| `/tools` | 全部工具，16 项一页 |
| `/tools/<tool-name>` | 工具详情 |
| `/links` | 全部网址，16 项一页 |
| `/links/manage` | 网址管理 |

首页每种内容最多展示前 5 项；只有总数超过 5 项时才显示第 6 张“查看更多”卡片。不要在首页重新实现完整列表筛选或分页。

## 4. 使用统一页面骨架

工具页应使用以下公共结构：

- `ToolPageHeader`：统一面包屑、工具名称、描述和标签。
- `.sr-panel`：作为输入区、结果区或配置区的基础容器。
- `ToolDocumentation`：统一展示用途、规则、示例和注意事项。

页面最外层使用 `.sr-page`，以获得统一留白、背景和装饰。工具页面应按以下顺序组织：

1. `ToolPageHeader`：分类、标题、页面说明和标签。
2. 一个或多个 `.sr-panel`：输入、配置、预览或结果区域。
3. `ToolDocumentation`：用途、规则、示例和注意事项。

桌面端输入区与结果区优先左右排列，移动端在合适的断点改为上下排列。面板只用于承载明确的输入、配置或结果，不要嵌套面板，也不要仅为装饰把每段内容都做成卡片。

## 5. 统一使用 Element Plus 控件

命令和表单控件必须优先使用 Element Plus，不要在工具页面自行绘制原生按钮或模拟组件。统一组件可以保证尺寸、圆角、聚焦状态、禁用状态和明暗主题一致。

| 使用场景 | 应使用的组件 |
| --- | --- |
| 普通操作、复制操作 | `ElButton` |
| 页面主要操作 | `ElButton` + `.sr-primary-button` |
| 需要强调的辅助操作 | `ElButton` + `.sr-secondary-button` |
| 多个互斥模式 | `ElRadioGroup` + `ElRadioButton` |
| 页面级内容切换 | `ElTabs` + `ElTabPane` |
| 数值输入与增减 | `ElInputNumber` |
| 二元状态 | `ElSwitch` |
| 颜色选择 | `ElColorPicker` |
| 标签筛选 | `ElCheckTag` |
| 列表分页 | `ElPagination` |
| 单行输入 | `ElInput` |
| 多行输入 | `ElInput type="textarea"` |
| 下拉选择 | `ElSelect` + `ElOption` |
| 文件选择或拖拽上传 | `ElUpload` |
| 颜色选择 | `ElColorPicker` |
| 成功或错误反馈 | `ElMessage` 或页面内状态提示 |

示例：

```vue
<el-radio-group v-model="mode">
  <el-radio-button value="format">格式化</el-radio-button>
  <el-radio-button value="minify">压缩</el-radio-button>
</el-radio-group>

<el-button class="sr-primary-button" type="primary" @click="run">
  开始处理
</el-button>
```

### 文件上传约束

本项目中的“上传”通常只是读取本地文件，不发送到服务器。使用 `ElUpload` 时关闭自动上传：

```vue
<el-upload
  :auto-upload="false"
  :show-file-list="false"
  accept=".json,application/json"
  :on-change="handleFile"
>
  <el-button class="sr-secondary-button">选择文件</el-button>
</el-upload>
```

事件处理函数读取 `UploadFile.raw`：

```ts
function handleFile(uploadFile: UploadFile) {
  const file = uploadFile.raw
  if (!file) return
  file.text().then((value) => {
    input.value = value
  })
}
```

### 可以保留原生元素的情况

- `RouterLink` 和普通链接继续使用语义正确的链接元素。
- 无复杂交互的结构元素继续使用 `section`、`article`、`label` 等 HTML 元素。
- 仅当 Element Plus 无法满足性能或功能要求时，才保留原生表单控件，并在代码注释中说明原因。

## 6. 遵循视觉与排版规范

### 页面与按钮规范

所有工具页遵循同一套层级，优先参考 JSON 工具的页面结构：

| 位置 | 规范 |
| --- | --- |
| 页面标题 | `ToolPageHeader`，26px、600 字重；不要在工具页自行定义另一套标题字号 |
| 页面说明 | 14px，使用 `--sr-text-muted`，行高 1.6 |
| 区块标题 | 15px、600 字重，使用 `.sr-tool-section-title` |
| 字段标签 | 15px、700 字重，使用 `.sr-tool-label` |
| 辅助说明 | 12px，使用 `.sr-tool-help` |
| 工具操作区 | 使用 `.sr-tool-actions`，按钮间距统一为 8px |

按钮按动作重要性分级。URL 编解码页的“复制结果”是普通按钮和禁用态的基准实现：

- `.sr-primary-button`：页面唯一主操作，使用白底、橙色边框和橙色文字，例如“开始处理”“生成”“计算”；悬停时使用浅橙色背景。
- 默认 `ElButton`：复制、交换、上传等普通操作，不额外指定 `type="primary"`，也不添加页面私有颜色。
- `.sr-secondary-button`：确实需要提高辨识度的辅助操作。
- `.sr-tertiary-button`：弱化操作，使用透明背景，例如“清空”“重置”。

按钮不可用时只设置 `:disabled`，由 Element Plus 和 `src/styles/main.scss` 统一呈现置灰效果：

```vue
<el-button :disabled="!output" @click="copy">复制结果</el-button>
```

不要为禁用按钮增加 `type="primary"` 后再用页面 CSS 模拟灰色，也不要覆盖 `.is-disabled` 的背景、边框、文字、悬停或明暗主题样式。按钮文案使用明确的中文动词，如“复制结果”“清空输入”“开始解析”，避免只写“确定”“操作”等含义模糊的词。

其他交互控件与按钮共用同一视觉语言：高度以 `38px` 为基准，圆角使用 `--sr-radius-control`，默认边框使用 `--sr-border`，当前选择和悬停使用 `--sr-blue` / `--sr-blue-soft`。Tab、分段单选、数字增减、开关、下拉框、日期和颜色选择器均直接使用全局样式；页面局部只设置宽度、排列和间距，不覆盖其颜色、边框、圆角、选中态或禁用态。

Tab 用于页面级内容切换，分段单选用于同一流程内的互斥模式，不要用一排普通按钮重复模拟这两类组件。数字字段必须使用 `ElInputNumber` 并设置合理的 `min`、`max`，不要自行拼接减号按钮、输入框和加号按钮。

一个页面通常只保留一个主操作按钮。不要通过页面局部样式覆盖主按钮颜色；橙色统一使用 `--sr-orange` 设计令牌。

- 正文基线为 `14px`，颜色使用 `--sr-text`，行高优先使用 `--sr-line-body`。
- 辅助说明、占位提示和状态补充为 `12px`，使用 `--sr-text-muted`；同一信息不要在标题下方和问号提示中重复展示。
- 错误、成功、警告和空状态文案全部使用中文，放在对应字段或结果区域附近，不展示依赖库原始英文异常。
- 工具标签统一为 `12px`，使用胶囊形标签样式。
- 相同层级的标题、字段名、提示和操作按钮必须保持一致。
- 蓝色用于主要操作和当前选择，橙色用于辅助操作、提示和局部强调。
- 不要在功能页面直接写另一套按钮尺寸、边框或选中态；公共规则位于 `src/styles/main.scss`。
- 页面局部样式只负责布局和该工具特有内容，不重复覆盖公共控件外观。
- 页面需要新增共用视觉规则时，先扩展 `src/styles/main.scss` 中的设计令牌或公共类，再由各工具复用；不要以某个功能目录下的 scoped CSS 作为其他页面的样式基准。
- 首页和列表页的工具、网址卡片应复用 `src/components/content/`，不要复制卡片模板或样式。

## 7. 拆分业务逻辑

转换、解析或统计函数应放在 `lib/` 中。函数尽量接收普通参数并返回普通对象，不直接读写页面状态，这样更容易测试。

## 8. 编写测试

为正常输入、边界输入和错误输入各写至少一个测试。运行：

```bash
npm run test
```

完成后还应运行：

```bash
npm run typecheck
```

- `typecheck` 检查 TypeScript 和 Vue 模板类型。
- `build` 验证生产静态文件可以正常生成。

## 9. 更新文档

在 `CHANGELOG.md` 的“未发布”章节记录新增功能或行为变化。若新增依赖或改变架构，同时更新 `docs/technology-stack.md` 或 `docs/architecture.md`。

若修改初始化网址、分类或导入导出规则，同时更新 `docs/superpowers/specs/2026-08-12-link-navigation-design.md`。
