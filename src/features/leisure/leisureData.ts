export interface LeisureItem { title: string; description: string; url: string; icon: string }
export interface LeisureCategory { id: string; title: string; description: string; items: LeisureItem[] }

export const leisureCategories: LeisureCategory[] = [
  { id: 'watch', title: '看点东西', description: '短视频、纪录片和有趣内容', items: [
    { title: '哔哩哔哩', description: '看看感兴趣的视频和直播', url: 'https://www.bilibili.com', icon: 'Play' },
    { title: 'YouTube', description: '探索全球创作者内容', url: 'https://www.youtube.com', icon: 'Youtube' },
  ] },
  { id: 'listen', title: '听点音乐', description: '让耳朵先离开工作状态', items: [
    { title: '网易云音乐', description: '听歌、播客和私人歌单', url: 'https://music.163.com', icon: 'Music2' },
    { title: 'Spotify', description: '发现新的音乐和播客', url: 'https://open.spotify.com', icon: 'Headphones' },
  ] },
  { id: 'wander', title: '逛逛社区', description: '看看别人的想法和生活', items: [
    { title: '知乎', description: '浏览问题、回答与想法', url: 'https://www.zhihu.com', icon: 'MessagesSquare' },
    { title: '豆瓣', description: '找电影、书和音乐推荐', url: 'https://www.douban.com', icon: 'BookOpen' },
  ] },
  { id: 'play', title: '玩一会儿', description: '几分钟的小憩和轻量游戏', items: [
    { title: 'Lichess', description: '来一盘在线国际象棋', url: 'https://lichess.org', icon: 'Crown' },
    { title: 'Neal.fun', description: '体验一组有趣的互动小游戏', url: 'https://neal.fun', icon: 'Gamepad2' },
  ] },
]

export const leisureItems = leisureCategories.flatMap(({ items }) => items)
