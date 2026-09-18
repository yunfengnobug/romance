// 以下为本地展示用 mock 数据，后续会替换为真实接口。
// 图片均为网络占位图，可直接换成真实婚纱照地址。
// 顺序按「随手上传」打乱：横竖穿插即可。瀑布流按列宽排，横图不会通栏。

export const weddingHero: any = {
  title: '婚纱照',
  subtitle: '相册骨架已备好，照片稍后一张张补上',
  cover: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&h=900&q=80',
}

export const weddingStory = {
  title: '我们的故事',
  text: '我们还没有把故事写完。这一页先把版式留好：照片稍后会一张张补上，文字也会慢慢填满。此刻只想把位置空出来，等真正的光进来。',
}

export const weddingPhotos: any[] = [
  {
    id: 'w2',
    src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&h=900&q=80',
    alt: '外景草坪',
    group: 'outdoor',
  },
  {
    id: 'w6',
    src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&h=900&q=80',
    alt: '仪式现场',
    group: 'indoor',
  },
  {
    id: 'w1',
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&h=1200&q=80',
    alt: '并肩站在光里',
    group: 'outdoor',
  },
  {
    id: 'w8',
    src: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1600&h=900&q=80',
    alt: '礼服近景',
    group: 'indoor',
  },
  {
    id: 'w5',
    src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&h=1200&q=80',
    alt: '室内窗边',
    group: 'indoor',
  },
  {
    id: 'w3',
    src: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&h=1200&q=80',
    alt: '牵手',
    group: 'outdoor',
  },
  {
    id: 'w7',
    src: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&h=1200&q=80',
    alt: '对视',
    group: 'indoor',
  },
  {
    id: 'w4',
    src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&h=900&q=80',
    alt: '花束特写',
    group: 'outdoor',
  },
  {
    id: 'w10',
    src: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=1600&h=900&q=80',
    alt: '仪式横构图',
    group: 'outdoor',
  },
  {
    id: 'w9',
    src: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=800&h=1200&q=80',
    alt: '海边外景',
    group: 'outdoor',
  },
]
