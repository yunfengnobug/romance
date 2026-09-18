// 以下为本地展示用 mock 数据，后续会替换为真实接口。
// 图片均为网络占位图，可直接换成真实地址。

export const momentsProfile: any = {
  nickname: '云枫',
  signature: '风过无痕，云停有声',
  avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&h=240&q=80',
  cover: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?auto=format&fit=crop&w=1400&h=800&q=80',
}

export const momentsPosts: any[] = [
  {
    id: 'm1',
    author: '云枫',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&h=240&q=80',
    text: '傍晚路过一棵枫树，叶子红得像被晚霞轻轻染过。拍了几张，风一吹就散了。',
    images: [
      'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?auto=format&fit=crop&w=800&q=80',
    ],
    time: '昨天 18:21',
    location: '杭州 · 西湖',
    likes: ['林深', '阿宁', '小满'],
    comments: [
      { user: '林深', text: '这片红真好看。' },
      { user: '云枫', text: '傍晚的光刚好。' },
    ],
  },
  {
    id: 'm2',
    author: '云枫',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&h=240&q=80',
    text: '下雨天适合坐在窗边发呆。咖啡慢慢凉了，书只翻了两页。',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=700&q=80',
    ],
    time: '昨天 11:04',
    location: '',
    likes: ['阿宁'],
    comments: [{ user: '阿宁', text: '下次带我一起发呆。' }],
  },
  {
    id: 'm3',
    author: '云枫',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&h=240&q=80',
    text: '海边的风把头发吹乱了，也把心事吹淡了一点。',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=700&q=80',
    ],
    time: '星期三',
    location: '舟山',
    likes: ['林深', '小满', '北岛', '阿宁'],
    comments: [
      { user: '小满', text: '这蓝太干净了。' },
      { user: '林深', text: '想去。' },
    ],
  },
  {
    id: 'm4',
    author: '云枫',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&h=240&q=80',
    text: '把旧相机翻出来，胶片还剩几张。先把窗台上的光记下来。',
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=700&q=80',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=700&q=80',
    ],
    time: '星期二 16:40',
    location: '',
    likes: ['北岛'],
    comments: [],
  },
  {
    id: 'm5',
    author: '云枫',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&h=240&q=80',
    text: '春天最后一场花，还是决定走去看看。人不多，风很轻。',
    images: [
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=601&q=80',
      'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80',
    ],
    time: '4月 12日',
    location: '灵隐',
    likes: ['阿宁', '小满'],
    comments: [{ user: '小满', text: '九宫格好满。' }],
  },
  {
    id: 'm6',
    author: '云枫',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&h=240&q=80',
    text: '今晚没有照片。就把这句话放在这里：日子普通，也很好。',
    images: [],
    time: '3月 28日',
    location: '',
    likes: ['林深', '阿宁'],
    comments: [{ user: '林深', text: '普通的日子最珍贵。' }],
  },
]
