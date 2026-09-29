// 页面上的标题/故事是静态文案。
// 下面的分类与照片只给 NUXT_PUBLIC_WEDDING_USE_MOCK 调试用，不是线上分类模型。
// 线上 tab 必须来自 admin 的 categories，不要在页面里写死 外景/室内 或 初修/精修/底图。

export const weddingHero: any = {
  title: '婚纱照',
  subtitle: '把光影留下来，把日子叠进相册',
}

export const weddingStory = {
  title: '我们的故事',
  text: '王俊杰与李朝新把日子叠进这一本相册。并肩、牵手、对视，都是不必多说的时刻。',
}

/** 调试夹具：名称只是示例，不代表产品分类 */
export const weddingCategories: any[] = [
  { id: 'demo-a', slug: 'demo-a', label: '示例一组', sort_order: 1 },
  { id: 'demo-b', slug: 'demo-b', label: '示例二组', sort_order: 2 },
]

/** 调试夹具：Unsplash 占位，仅 mock 开关打开时使用 */
export const weddingPhotos: any[] = [
  {
    id: 'w2',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&h=900&q=80',
    alt: '示例一组',
    category_slug: 'demo-a',
    sort_order: 1,
  },
  {
    id: 'w6',
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&h=900&q=80',
    alt: '示例二组',
    category_slug: 'demo-b',
    sort_order: 2,
  },
  {
    id: 'w1',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&h=1200&q=80',
    alt: '示例一组',
    category_slug: 'demo-a',
    sort_order: 3,
  },
  {
    id: 'w8',
    url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1600&h=900&q=80',
    alt: '示例二组',
    category_slug: 'demo-b',
    sort_order: 4,
  },
  {
    id: 'w5',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&h=1200&q=80',
    alt: '示例二组',
    category_slug: 'demo-b',
    sort_order: 5,
  },
  {
    id: 'w3',
    url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&h=1200&q=80',
    alt: '示例一组',
    category_slug: 'demo-a',
    sort_order: 6,
  },
]
