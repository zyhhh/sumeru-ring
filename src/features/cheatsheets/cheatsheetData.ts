export interface CheatsheetEntry { key: string; syntax: string; description: string }
export interface Cheatsheet { id: string; title: string; entries: CheatsheetEntry[] }
export interface RegexExample { title: string; pattern: string; text: string; explanation: string }

export const regexExamples: RegexExample[] = [
  { title: '手机号', pattern: '^1[3-9]\\d{9}$', text: '13800138000', explanation: '以 1 开头，第二位为 3-9，后面再跟 9 位数字。' },
  { title: '邮箱', pattern: '^[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,}$', text: 'dev@example.com', explanation: '匹配常见的用户名、@、域名和顶级域名结构。' },
  { title: '日期', pattern: '^\\d{4}-\\d{2}-\\d{2}$', text: '2026-08-19', explanation: '匹配 YYYY-MM-DD 格式的日期文本。' },
  { title: '提取数字', pattern: '\\d+', text: '订单号：A-1024', explanation: '从混合文本中找到连续数字 1024。' },
]

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
    { key: '当前目录', syntax: 'pwd', description: '显示当前工作目录' }, { key: '列出文件', syntax: 'ls -lah', description: '查看全部文件及详细信息' }, { key: '切换目录', syntax: 'cd path', description: '进入指定目录' },
    { key: '创建目录', syntax: 'mkdir -p path', description: '递归创建目录' }, { key: '复制', syntax: 'cp -r src dest', description: '复制文件或目录' }, { key: '移动/改名', syntax: 'mv src dest', description: '移动文件或重命名' },
    { key: '删除', syntax: 'rm -rf path', description: '递归强制删除，谨慎使用' }, { key: '查找文件', syntax: 'find . -name "*.log"', description: '按名称递归查找文件' }, { key: '查找文本', syntax: 'rg "keyword" path', description: '在目录中搜索文本' },
    { key: '查看文件', syntax: 'less -N file', description: '分页查看并显示行号' }, { key: '前后几行', syntax: 'head -n 20 file', description: '查看文件开头内容' }, { key: '跟踪日志', syntax: 'tail -f app.log', description: '持续输出新增内容' },
    { key: '文本处理', syntax: 'grep -n "key" file', description: '带行号搜索文本' }, { key: '替换文本', syntax: 'sed -i "s/a/b/g" file', description: '批量替换文件内容' }, { key: '统计行数', syntax: 'wc -l file', description: '统计文件行数' },
    { key: '进程列表', syntax: 'ps aux', description: '列出所有进程' }, { key: '结束进程', syntax: 'kill -15 PID', description: '向进程发送终止信号' }, { key: '端口占用', syntax: 'lsof -i :8080', description: '查看占用指定端口的进程' },
    { key: '磁盘空间', syntax: 'df -h', description: '查看文件系统空间' }, { key: '目录大小', syntax: 'du -sh path', description: '统计目录占用空间' }, { key: '权限修改', syntax: 'chmod +x script.sh', description: '给脚本增加执行权限' },
    { key: '压缩', syntax: 'tar -czf out.tar.gz dir', description: '创建 gzip 压缩包' }, { key: '解压', syntax: 'tar -xzf file.tar.gz', description: '解压 gzip 压缩包' }, { key: '网络请求', syntax: 'curl -I https://example.com', description: '查看响应头' },
  ] },
  { id: 'regex', title: '正则语法', entries: [
    { key: '任意字符', syntax: '.', description: '匹配任意单个字符（通常不含换行）' }, { key: '行边界', syntax: '^文本$', description: '匹配一行的开头与结尾' },
    { key: '重复次数', syntax: '* / + / ?', description: '控制前一项重复 0 次以上、1 次以上或 0-1 次' }, { key: '指定次数', syntax: '{n,m}', description: '指定前一项重复 n 到 m 次' },
    { key: '字符组', syntax: '[abc]', description: '匹配集合中的一个字符' }, { key: '否定字符组', syntax: '[^abc]', description: '匹配集合外的一个字符' },
    { key: '预定义字符类', syntax: '\\d / \\w / \\s', description: '分别匹配数字、单词字符和空白字符' }, { key: '非捕获组', syntax: '(?:...)', description: '分组但不保存匹配结果' },
    { key: '捕获分组', syntax: '(ab|cd)', description: '分组并保存匹配结果，可用于提取' }, { key: '分支选择', syntax: 'cat|dog', description: '匹配左侧或右侧任一分支' },
    { key: '单词边界', syntax: '\\bword\\b', description: '匹配单词边界，避免匹配前后缀' }, { key: '懒惰匹配', syntax: '.*? / .+?', description: '满足条件时尽可能少地匹配字符' },
  ] },
  { id: 'git', title: 'Git 命令', entries: [
    { key: '工作区状态', syntax: 'git status --short', description: '紧凑显示文件改动' }, { key: '查看差异', syntax: 'git diff', description: '查看尚未暂存的改动' },
    { key: '暂存改动', syntax: 'git add <path>', description: '将指定文件加入暂存区' }, { key: '提交', syntax: 'git commit -m "message"', description: '创建本地提交' },
    { key: '分支列表', syntax: 'git branch -vv', description: '显示本地分支及上游' }, { key: '切换分支', syntax: 'git switch <branch>', description: '切换到已有分支' },
    { key: '新建分支', syntax: 'git switch -c <branch>', description: '创建并切换分支' }, { key: '提交历史', syntax: 'git log --oneline --graph', description: '图形化查看精简历史' },
    { key: '临时保存', syntax: 'git stash push -m "note"', description: '暂存未提交改动' }, { key: '恢复暂存', syntax: 'git stash pop', description: '应用并移除最近暂存' },
    { key: '远程仓库', syntax: 'git remote -v', description: '查看远程仓库地址' }, { key: '拉取更新', syntax: 'git pull --rebase', description: '变基方式拉取远程更新' }, { key: '推送分支', syntax: 'git push -u origin <branch>', description: '推送并建立上游关联' },
    { key: '查看提交', syntax: 'git show <commit>', description: '查看某次提交详情' }, { key: '按文件历史', syntax: 'git log -- path', description: '查看指定文件的提交历史' }, { key: '撤销暂存', syntax: 'git restore --staged <path>', description: '将文件移出暂存区' },
    { key: '丢弃改动', syntax: 'git restore <path>', description: '恢复工作区文件，谨慎使用' }, { key: '修改提交', syntax: 'git commit --amend', description: '修改最近一次提交' }, { key: '合并分支', syntax: 'git merge <branch>', description: '将指定分支合并到当前分支' },
    { key: '变基', syntax: 'git rebase <branch>', description: '将当前提交移到目标分支之后' }, { key: '解决冲突后续', syntax: 'git rebase --continue', description: '冲突解决后继续变基' }, { key: '删除分支', syntax: 'git branch -d <branch>', description: '删除已合并的本地分支' },
    { key: '标签', syntax: 'git tag v1.0.0', description: '创建版本标签' }, { key: '回退提交', syntax: 'git revert <commit>', description: '用新提交安全撤销变更' }, { key: '暂存并切换', syntax: 'git stash && git switch <branch>', description: '保存改动后切换分支' },
  ] },
  { id: 'docker', title: 'Docker 命令', entries: [
    { key: '版本', syntax: 'docker version', description: '查看客户端与服务端版本' }, { key: '镜像列表', syntax: 'docker images', description: '列出本地镜像' }, { key: '搜索镜像', syntax: 'docker search nginx', description: '搜索 Docker Hub 镜像' },
    { key: '拉取镜像', syntax: 'docker pull nginx:latest', description: '下载指定镜像' }, { key: '构建镜像', syntax: 'docker build -t app:latest .', description: '根据 Dockerfile 构建镜像' }, { key: '删除镜像', syntax: 'docker rmi <image>', description: '删除本地镜像' },
    { key: '运行容器', syntax: 'docker run -d --name web -p 8080:80 nginx', description: '后台运行并映射端口' }, { key: '容器列表', syntax: 'docker ps -a', description: '列出运行中及已停止容器' }, { key: '启动/停止', syntax: 'docker start|stop <container>', description: '启动或停止容器' },
    { key: '重启容器', syntax: 'docker restart <container>', description: '重启指定容器' }, { key: '查看日志', syntax: 'docker logs -f <container>', description: '持续跟踪容器日志' }, { key: '进入容器', syntax: 'docker exec -it <container> sh', description: '进入运行中的容器' },
    { key: '复制文件', syntax: 'docker cp <container>:/src ./dest', description: '在容器与主机间复制文件' }, { key: '查看详情', syntax: 'docker inspect <container>', description: '查看容器或镜像详细配置' }, { key: '资源占用', syntax: 'docker stats', description: '实时查看容器资源使用' },
    { key: '清理容器', syntax: 'docker container prune', description: '删除已停止容器' }, { key: '清理镜像', syntax: 'docker image prune', description: '删除悬空镜像' }, { key: 'Compose 启动', syntax: 'docker compose up -d', description: '后台启动 Compose 服务' },
  ] },
]
