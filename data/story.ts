// 「日子」页静态文案：从 yunfeng /love/story（love-story-content）迁入。
// 时间线在原站「我们在一起了」之外补上订婚、结婚。

/** 在一起起始日（上海日历日） */
export const STORY_START_DATE_KEY = '2025-06-20'

export const STORY_TITLE = '李朝新，我爱你'

export const STORY_SUBTITLE = '每一天都比昨天更爱你'

export const STORY_CARDS = [
  { icon: '😊', title: '你的笑容', text: '如春风般温暖，如阳光般灿烂，是我心中最美的风景' },
  { icon: '🎵', title: '你的声音', text: '如天籁般动听，如清泉般甘甜，是我最爱的旋律' },
  { icon: '👀', title: '你的眼睛', text: '如星辰般闪亮，如大海般深邃，是我永远的港湾' },
  { icon: '🤗', title: '你的拥抱', text: '如暖阳般温暖，如港湾般安全，是我最渴望的归宿，想抱抱' },
  { icon: '🌙', title: '你的温柔', text: '如月光般柔和，如丝绸般细腻，是我最珍贵的宝藏' },
  { icon: '👧', title: '你的可爱', text: '软软糯糯的小脸，机智又可爱，让人想捏捏' },
]

export const STORY_TIMELINE = [
  {
    icon: '🌅',
    title: '在一起',
    date: '2025年6月20日',
    text: '那天红玫瑰飘香，现在想来都是甜蜜。你的手那么柔软，那么温暖，牵着你的手，我感觉拥有了整个世界。',
  },
  {
    icon: '💍',
    title: '订婚',
    date: '2026年8月30日',
    text: '戒指轻轻落在你的指上，夏天还没走完。从那天起，往后的日子有了更确定的名字。',
  },
  {
    icon: '💒',
    title: '结婚',
    date: '2026年9月12日',
    text: '在亲朋好友的见证里，我们把一生说给彼此听。礼成之后，光还在，你也在。',
  },
]

export const STORY_MESSAGES = [
  { icon: '✨', text: '你是我生命中最美好的意外' },
  { icon: '🍀', text: '遇见你是我最大的幸运' },
  { icon: '😊', text: '你的笑容是我最大的幸福' },
  { icon: '👴👵', text: '我想和你一起变老' },
  { icon: '👸', text: '你是我心中永远的公主' },
  { icon: '💝', text: '我爱你胜过爱自己' },
  { icon: '🚀', text: '你是我前进的动力' },
  { icon: '🍯', text: '愿我们的爱情永远甜蜜' },
  { icon: '⭐', text: '你是我心中最亮的星' },
  { icon: '🏠', text: '我想给你最好的生活' },
  { icon: '💎', text: '你是我最珍贵的宝贝' },
  { icon: '🌟', text: '愿我们的爱情如星辰般永恒' },
]

export const STORY_PLANS = [
  { icon: '🌍', title: '环游世界', text: '和你一起看遍世界各地的美景，留下我们美好的回忆' },
  { icon: '🏡', title: '温馨的家', text: '建造一个属于我们的小窝，充满爱和温暖' },
  { icon: '🐕', title: '养一只宠物', text: '一起照顾我们的小宝贝，体验做父母的快乐' },
  { icon: '📚', title: '学习新技能', text: '一起成长，一起进步，成为更好的自己' },
  { icon: '🏃‍♀️', title: '健康生活', text: '一起运动，一起养生，拥有健康的身体' },
  { icon: '💒', title: '浪漫的婚礼', text: '在亲朋好友的见证下，许下我们一生的承诺' },
]

export const STORY_LETTER_LINES = [
  '亲爱的朝新，遇见你是我生命中最美好的奇迹。',
  '你的笑容如阳光般温暖，你的声音如天籁般动听。',
  '我想和你一起看遍世间美景，一起走过每一个春夏秋冬。',
  '愿我们的爱情如星辰般永恒，如大海般深邃。',
  '我爱你，李朝新！',
  '愿我们的爱情故事永远继续下去，直到永远。',
  '"下辈子，我们还在一起。"上辈子，我们也是这么说的。',
]

// 上海日历日差（起始日当天为 0），与 yunfeng 的「爱你的第 N 天」一致
export function storyDaysTogether(now: number | Date = Date.now()) {
  const todayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(now))
  const startMs = Date.parse(`${STORY_START_DATE_KEY}T00:00:00+08:00`)
  const todayMs = Date.parse(`${todayKey}T00:00:00+08:00`)
  if (!Number.isFinite(startMs) || !Number.isFinite(todayMs)) return 0
  return Math.max(0, Math.round((todayMs - startMs) / 86_400_000))
}
