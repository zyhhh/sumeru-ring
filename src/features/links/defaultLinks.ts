import type {LinkItem} from './types'

const createdAt = '2026-08-12T00:00:00.000Z'

// 这些数据只在首次使用或执行“恢复默认网址”时写入 IndexedDB。
export const defaultLinks: LinkItem[] = [
    {
        id: 'default-jyshare',
        title: 'JyShare 在线工具',
        url: 'https://www.jyshare.com/front-end/9443/',
        category: '工具',
        tags: ['前端', '在线工具'],
        description: '常用前端在线工具页面',
        order: 10,
        isDefault: true,
        createdAt,
        updatedAt: createdAt
    },
    {
        id: 'default-chinaz-dns',
        title: '站长 DNS 查询',
        url: 'https://tool.chinaz.com/dns',
        category: '工具',
        tags: ['DNS', '站长工具'],
        description: 'DNS 查询与域名解析检测',
        order: 20,
        isDefault: true,
        createdAt,
        updatedAt: createdAt
    },
    {
        id: 'default-jwt',
        title: 'JWT.io',
        url: 'https://jwt.io/',
        category: '工具',
        tags: ['JWT', '开发'],
        description: 'JWT 官方调试与文档工具',
        order: 30,
        isDefault: true,
        createdAt,
        updatedAt: createdAt
    },
    {
        id: 'default-cli-im',
        title: '草料二维码',
        url: 'https://cli.im/',
        category: '工具',
        tags: ['二维码', '在线工具'],
        description: '二维码生成、管理与应用服务',
        order: 40,
        isDefault: true,
        createdAt,
        updatedAt: createdAt
    },
    {
        id: 'default-724ai',
        title: '724AI',
        url: 'https://724ai.org/',
        category: '中转站',
        tags: ['AI', '中转站'],
        description: 'AI 服务中转站',
        order: 50,
        isDefault: true,
        createdAt,
        updatedAt: createdAt
    },
    {
        id: 'default-pucoding',
        title: 'PU Coding',
        url: 'https://pucoding.com/',
        category: '中转站',
        tags: ['AI', '中转站'],
        description: 'AI 服务中转站',
        order: 60,
        isDefault: true,
        createdAt,
        updatedAt: createdAt
    },
    {
        id: 'default-1ms',
        title: '1MS',
        url: 'https://1ms.run/',
        category: '资源',
        tags: ['资源'],
        description: '毫秒镜像',
        order: 70,
        isDefault: true,
        createdAt,
        updatedAt: createdAt
    },
    {
        id: 'default-foxirj',
        title: 'Foxirj',
        url: 'https://foxirj.com/',
        category: '资源',
        tags: ['资源'],
        description: '软件下载',
        order: 80,
        isDefault: true,
        createdAt,
        updatedAt: createdAt
    },
    {
        id: 'default-pinglian',
        title: 'Pinglian',
        url: 'https://pinglian.lol/',
        category: '影视',
        tags: ['影视'],
        description: '影视内容站点',
        order: 90,
        isDefault: true,
        createdAt,
        updatedAt: createdAt
    },
]

