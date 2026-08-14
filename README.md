# SUMERU RING

SUMERU RING 是一个纯前端个人开发工具工作台。当前包含 JWT 解析、二维码生成与识别、JSON 工具、URL 编解码和字符数统计。所有输入默认只在浏览器内存中处理，不需要后端。

## 环境要求

- Node.js 22 或更高版本
- npm 10 或更高版本

## 本地运行

```bash
npm install
npm run dev
```

终端会显示本地地址，默认通常是 `http://localhost:5173`。

## 常用命令

```bash
npm run test       # 执行核心逻辑单元测试
npm run typecheck  # 检查 TypeScript 与 Vue 模板类型
npm run build      # 类型检查并生成生产静态文件
npm run lint       # 检查代码规范
```

## 目录说明

```text
src/
├── components/     # 应用布局和工具通用组件
├── features/       # 每个工具的页面、核心逻辑和测试
├── registry/       # 内容注册表，首页和搜索的数据源
├── router/         # 页面路由
├── stores/         # 主题和侧栏等跨页面状态
├── styles/         # 全局设计令牌和样式
└── views/          # 首页等应用级页面
```

更完整的说明见：

- [技术选型](docs/technology-stack.md)
- [架构设计](docs/architecture.md)
- [新增工具指南](docs/tool-development-guide.md)
- [首期设计规格](docs/superpowers/specs/2026-08-12-sumeru-ring-design.md)

## 生产构建

```bash
npm install
npm run build
```

静态文件输出到 `dist/`。

## Nginx 部署

将 `dist/` 内容上传到服务器目录，例如 `/var/www/sumeru-ring`。核心配置：

```nginx
server {
    listen 80;
    server_name your-domain.example;
    root /var/www/sumeru-ring;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|svg|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }
}
```

`try_files` 的回退配置不能省略，否则直接访问工具路由时 Nginx 会返回 404。

