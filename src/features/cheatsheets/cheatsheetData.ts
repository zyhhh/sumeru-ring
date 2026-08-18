export interface CheatsheetEntry { key: string; syntax: string; description: string }
export interface Cheatsheet { id: string; title: string; entries: CheatsheetEntry[] }

export const cheatsheets: Cheatsheet[] = [
  { id: 'http', title: 'HTTP 状态码', entries: [
    { key: '200', syntax: 'OK', description: '请求成功' }, { key: '201', syntax: 'Created', description: '资源创建成功' },
    { key: '204', syntax: 'No Content', description: '成功但无响应正文' }, { key: '301', syntax: 'Moved Permanently', description: '永久重定向' },
    { key: '304', syntax: 'Not Modified', description: '缓存仍然有效' }, { key: '400', syntax: 'Bad Request', description: '请求参数或格式错误' },
    { key: '401', syntax: 'Unauthorized', description: '尚未通过身份认证' }, { key: '403', syntax: 'Forbidden', description: '无权访问资源' },
    { key: '404', syntax: 'Not Found', description: '资源不存在' }, { key: '409', syntax: 'Conflict', description: '请求与当前状态冲突' },
    { key: '429', syntax: 'Too Many Requests', description: '请求频率过高' }, { key: '500', syntax: 'Internal Server Error', description: '服务器内部错误' },
    { key: '502', syntax: 'Bad Gateway', description: '上游服务响应异常' }, { key: '503', syntax: 'Service Unavailable', description: '服务暂时不可用' },
  ] },
  { id: 'linux', title: 'Linux 命令', entries: [
    { key: '查找文件', syntax: 'find . -name "*.log"', description: '递归查找日志文件' }, { key: '查找文本', syntax: 'rg "keyword" path', description: '在目录中搜索文本' },
    { key: '端口占用', syntax: 'lsof -i :8080', description: '查看占用指定端口的进程' }, { key: '磁盘空间', syntax: 'df -h', description: '查看文件系统空间' },
    { key: '目录大小', syntax: 'du -sh path', description: '统计目录占用空间' }, { key: '跟踪日志', syntax: 'tail -f app.log', description: '持续输出文件新增内容' },
    { key: '进程列表', syntax: 'ps aux', description: '列出所有进程' }, { key: '打包压缩', syntax: 'tar -czf out.tar.gz dir', description: '创建 gzip 压缩包' },
  ] },
  { id: 'regex', title: '正则语法', entries: [
    { key: '.', syntax: '任意字符', description: '默认不匹配换行符' }, { key: '^ / $', syntax: '开头 / 结尾', description: '匹配文本或行的边界' },
    { key: '* / + / ?', syntax: '0+ / 1+ / 0-1 次', description: '控制前一项重复次数' }, { key: '{n,m}', syntax: 'n 到 m 次', description: '指定重复次数范围' },
    { key: '[abc]', syntax: '字符组', description: '匹配集合中的一个字符' }, { key: '[^abc]', syntax: '否定字符组', description: '匹配集合外的一个字符' },
    { key: '\\d / \\w / \\s', syntax: '数字 / 单词 / 空白', description: '常用预定义字符类' }, { key: '(?:...)', syntax: '非捕获组', description: '分组但不保存匹配结果' },
  ] },
  { id: 'git', title: 'Git 命令', entries: [
    { key: '工作区状态', syntax: 'git status --short', description: '紧凑显示文件改动' }, { key: '查看差异', syntax: 'git diff', description: '查看尚未暂存的改动' },
    { key: '暂存改动', syntax: 'git add <path>', description: '将指定文件加入暂存区' }, { key: '提交', syntax: 'git commit -m "message"', description: '创建本地提交' },
    { key: '分支列表', syntax: 'git branch -vv', description: '显示本地分支及上游' }, { key: '切换分支', syntax: 'git switch <branch>', description: '切换到已有分支' },
    { key: '新建分支', syntax: 'git switch -c <branch>', description: '创建并切换分支' }, { key: '提交历史', syntax: 'git log --oneline --graph', description: '图形化查看精简历史' },
    { key: '临时保存', syntax: 'git stash push -m "note"', description: '暂存未提交改动' }, { key: '恢复暂存', syntax: 'git stash pop', description: '应用并移除最近暂存' },
  ] },
]
