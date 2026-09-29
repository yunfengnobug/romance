/**
 * 七牛 CDN 展示地址：只在 img.yzre.cn / 常见七牛域名上追加处理参数，
 * 婚纱照与朋友圈共用。不改接口返回的原 URL，也不动 Unsplash 等外链。
 * 图片：https://developer.qiniu.com/dora/1279/basic-processing-images-imageview2
 * 视频帧：https://developer.qiniu.com/dora/1313/video-frame-thumbnails-vframe
 *
 * 请求宽公式：ceil(cssWidth × dpr × 1.2 / 80) × 80，夹在 160–2200。
 * 比「CSS 像素 × DPR」略大，视网膜上不发糊，又不会去拉原图。
 */

const QINIU_HOSTS = new Set(['img.yzre.cn'])
const QINIU_HOST_SUFFIXES = ['.qiniucdn.com', '.clouddn.com', '.qnssl.com', '.qbox.me']

export const QINIU_WIDTH_FACTOR = 1.2
export const QINIU_WIDTH_STEP = 80
export const QINIU_WIDTH_MAX = 2200
export const QINIU_WIDTH_MIN = 160
export const QINIU_DPR_MAX = 3

/** 尚未量到盒子时的兜底（约等于常见手机 3x / 桌面 2x） */
export const QINIU_FALLBACK_THUMB = 640
export const QINIU_FALLBACK_HERO = 1400
export const QINIU_FALLBACK_PREVIEW = 1600
export const QINIU_FALLBACK_MOMENT_THUMB = 400
export const QINIU_FALLBACK_MOMENT_COVER = 1200
export const QINIU_FALLBACK_AVATAR = 240

const VIDEO_EXT = /\.(mp4|mov|m4v|webm|ogg|ogv|m3u8)(?:$|[?#])/i

/** 是否为七牛 / img.yzre.cn 图床，外链原样返回 */
export function isQiniuCdnUrl(url: string): boolean {
  const raw = String(url || '').trim()
  if (!raw) return false
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
    const host = parsed.hostname.toLowerCase()
    if (QINIU_HOSTS.has(host)) return true
    return QINIU_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))
  }
  catch {
    return false
  }
}

/**
 * 去掉已有的七牛图片处理参数，得到原图地址
 * @param url 原图或任意 CDN 地址
 */
export function getPhotoOriginUrl(url: string): string {
  const raw = String(url || '').trim()
  if (!raw) return ''
  const hashIndex = raw.indexOf('#')
  const withoutHash = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw
  const qIndex = withoutHash.indexOf('?')
  if (qIndex < 0) return withoutHash
  const base = withoutHash.slice(0, qIndex)
  const query = withoutHash.slice(qIndex + 1)
  // 剔除 imageView2 / imageslim / vframe，保留其它业务参数
  const kept = query
    .split('&')
    .filter((part) => {
      if (!part) return false
      if (part.startsWith('imageView2') || part === 'imageslim') return false
      if (part.startsWith('vframe')) return false
      return true
    })
    .join('&')
  return kept ? `${base}?${kept}` : base
}

/**
 * 请求宽 = ceil(渲染 CSS 宽 × dpr × 1.2 / 80) × 80，限制 160–2200。
 * cssWidth <= 0 时返回 0，由调用方继续用兜底。
 */
export function resolveQiniuRequestWidth(cssWidth: number, dpr?: number): number {
  const css = Number(cssWidth)
  if (!(css > 0)) return 0
  const rawDpr = dpr == null ? getDevicePixelRatio() : Number(dpr)
  const ratio = Math.min(Math.max(Number.isFinite(rawDpr) && rawDpr > 0 ? rawDpr : 1, 1), QINIU_DPR_MAX)
  const raw = css * ratio * QINIU_WIDTH_FACTOR
  const stepped = Math.ceil(raw / QINIU_WIDTH_STEP) * QINIU_WIDTH_STEP
  return Math.min(QINIU_WIDTH_MAX, Math.max(QINIU_WIDTH_MIN, stepped))
}

/** 当前设备像素比，SSR 当 1，上限 3 避免极端屏拉过大图 */
export function getDevicePixelRatio(): number {
  if (typeof window === 'undefined') return 1
  const dpr = Number(window.devicePixelRatio) || 1
  return Math.min(Math.max(dpr, 1), QINIU_DPR_MAX)
}

/** 元素渲染 CSS 宽（clientWidth 与 getBoundingClientRect 取较大值） */
export function measureCssWidth(el: Element | null | undefined): number {
  if (!el) return 0
  const client = Number((el as HTMLElement).clientWidth) || 0
  const rect = typeof el.getBoundingClientRect === 'function' ? el.getBoundingClientRect().width : 0
  return Math.max(client, Number(rect) || 0)
}

/** 去掉左右 padding 后的内容宽（灯箱对话盒） */
export function measureContentCssWidth(el: Element | null | undefined): number {
  const total = measureCssWidth(el)
  if (total <= 0 || !el || typeof getComputedStyle !== 'function') return total
  const style = getComputedStyle(el)
  const pad = (Number.parseFloat(style.paddingLeft) || 0) + (Number.parseFloat(style.paddingRight) || 0)
  return Math.max(0, total - pad)
}

/** 多列瀑布流单列 CSS 宽 */
export function measureColumnCssWidth(gridEl: Element | null | undefined): number {
  const total = measureCssWidth(gridEl)
  if (total <= 0 || !gridEl) return 0
  let cols = 1
  let gap = 0
  if (typeof getComputedStyle === 'function') {
    const style = getComputedStyle(gridEl)
    cols = Number.parseInt(style.columnCount, 10) || 1
    gap = Number.parseFloat(style.columnGap) || 0
  }
  cols = Math.max(1, cols)
  return Math.max(0, (total - gap * (cols - 1)) / cols)
}

/** 灯箱约等于视口：innerWidth 减去左右 16px padding */
export function measureViewportCssWidth(): number {
  if (typeof window === 'undefined') return 0
  return Math.max(0, window.innerWidth - 32)
}

/**
 * 拼接七牛 imageView2（mode=2：限定宽高内等比缩放，不裁切）
 * 非七牛域名原样返回，避免给 Unsplash 等外链加无效参数
 */
export function buildQiniuImageUrl(url: string, options: { width?: number, quality?: number, format?: string } = {}): string {
  const origin = getPhotoOriginUrl(url)
  if (!origin) return ''
  if (!isQiniuCdnUrl(origin)) return origin

  const width = Number(options.width) > 0 ? Math.round(Number(options.width)) : 800
  const quality = Number(options.quality) > 0 ? Math.round(Number(options.quality)) : 75
  const format = String(options.format || 'webp').toLowerCase()

  const base = origin.split('#')[0].replace(/\?$/, '')
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}imageView2/2/w/${width}/q/${quality}/format/${format}/ignore-error/1`
}

/** 列表缩略图；width 由格子实测传入，缺省用兜底 */
export function buildPhotoThumbUrl(url: string, width = QINIU_FALLBACK_THUMB): string {
  return buildQiniuImageUrl(url, { width, quality: 62, format: 'webp' })
}

/** 灯箱预览图；width 由视口 / 对话盒实测传入 */
export function buildPhotoPreviewUrl(url: string, width = QINIU_FALLBACK_PREVIEW): string {
  return buildQiniuImageUrl(url, { width, quality: 75, format: 'webp' })
}

/** 封面主视觉；width 由 hero 盒子实测传入 */
export function buildPhotoHeroUrl(url: string, width = QINIU_FALLBACK_HERO): string {
  return buildQiniuImageUrl(url, { width, quality: 70, format: 'webp' })
}

/** 头像：略提高质量，避免小图发糊 */
export function buildPhotoAvatarUrl(url: string, width = QINIU_FALLBACK_AVATAR): string {
  return buildQiniuImageUrl(url, { width, quality: 72, format: 'webp' })
}

/** 看起来是视频地址（扩展名或 query 里的常见容器） */
export function isLikelyVideoUrl(url: string): boolean {
  const raw = String(url || '').trim()
  if (!raw) return false
  if (/^(?:video)\//i.test(raw)) return true
  try {
    const parsed = new URL(raw, 'https://img.yzre.cn')
    if (VIDEO_EXT.test(parsed.pathname)) return true
    return VIDEO_EXT.test(parsed.search)
  }
  catch {
    return VIDEO_EXT.test(raw)
  }
}

/**
 * 七牛视频封面：抽第 1 秒关键帧，再按展示宽出 webp。
 * 非七牛域名返回空，由调用方改用已上传的 cover。
 */
export function buildQiniuVideoPosterUrl(url: string, width = QINIU_FALLBACK_MOMENT_THUMB): string {
  const origin = getPhotoOriginUrl(url)
  if (!origin || !isQiniuCdnUrl(origin)) return ''
  const w = Number(width) > 0 ? Math.round(Number(width)) : QINIU_FALLBACK_MOMENT_THUMB
  const base = origin.split('#')[0].replace(/\?$/, '')
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}vframe/jpg/offset/1/w/${w}|imageView2/2/w/${w}/q/70/format/webp/ignore-error/1`
}
