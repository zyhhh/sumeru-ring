# 新增工具指南

本文面向不熟悉前端工程的维护者。

## 1. 创建功能目录

在 `src/features/` 下创建独立目录，例如 `text-diff/`。页面放入 `views/`，不依赖 Vue 的算法放入 `lib/`。

## 2. 注册工具

在 `src/registry/contentRegistry.ts` 添加一条注册项。首页概览、小工具完整列表和全局搜索会自动读取该数据，不需要分别维护卡片内容。

网址导航属于运行时数据，不写入工具注册表。默认网址维护在 `src/features/links/defaultLinks.ts`，用户新增和修改的数据通过 `linkRepository.ts` 保存到 IndexedDB。新增网址相关能力时，页面应调用仓库函数，不要直接操作 `indexedDB`。

## 3. 添加路由

在 `src/router/index.ts` 中使用动态 `import()` 添加页面。动态加载可以避免用户打开首页时下载所有工具代码。工具详情路由需要设置唯一 `name`，并声明 `meta: { navigation: 'tools' }`，这样侧栏只会高亮“小工具”。

```ts
{
  path: '/tools/text-diff',
  name: 'tool-text-diff',
  component: () => import('@/features/text-diff/views/TextDiffToolView.vue'),
  meta: { navigation: 'tools' },
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

## 4. 使用统一页面组件

工具页应使用以下公共结构：

- `ToolPageHeader`：统一面包屑、工具名称、描述和标签。
- `.sr-panel`：作为输入区、结果区或配置区的基础容器。
- `ToolDocumentation`：统一展示用途、规则、示例和注意事项。

页面最外层使用 `.sr-page`，以获得统一留白、淡绿色背景和圆环装饰。桌面端输入区与结果区优先左右排列，移动端在合适的断点改为上下排列。

## 5. 统一使用 Element Plus 控件

命令和表单控件必须优先使用 Element Plus，不要在工具页面自行绘制原生按钮或模拟组件。统一组件可以保证尺寸、圆角、聚焦状态、禁用状态和明暗主题一致。

| 使用场景 | 应使用的组件 |
| --- | --- |
| 普通命令 | `ElButton` |
| 主要操作 | `ElButton` + `.sr-primary-button` |
| 橙色辅助操作 | `ElButton` + `.sr-secondary-button` |
| 多个互斥模式 | `ElRadioGroup` + `ElRadioButton` |
| 页面级内容切换 | `ElTabs` + `ElTabPane` |
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

- 正文基线为 `14px`，辅助文字通常不低于 `12px`。
- 工具标签统一为 `12px`，使用胶囊形标签样式。
- 相同层级的标题、字段名、提示和操作按钮必须保持一致。
- 蓝色用于主要操作和当前选择，橙色用于辅助操作、提示和局部强调。
- 不要在功能页面直接写另一套按钮尺寸、边框或选中态；公共规则位于 `src/styles/main.scss`。
- 页面局部样式只负责布局和该工具特有内容，不重复覆盖公共控件外观。
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
npm run build
```

- `typecheck` 检查 TypeScript 和 Vue 模板类型。
- `build` 验证生产静态文件可以正常生成。

## 9. 更新文档

在 `CHANGELOG.md` 的“未发布”章节记录新增功能或行为变化。若新增依赖或改变架构，同时更新 `docs/technology-stack.md` 或 `docs/architecture.md`。

若修改初始化网址、分类或导入导出规则，同时更新 `docs/superpowers/specs/2026-08-12-link-navigation-design.md`。
