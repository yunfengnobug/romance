/**
 * 婚纱照 CDN 展示地址：只在 img.yzre.cn / 常见七牛域名上追加 imageView2，
 * 不改接口返回的原 URL，也不动 Unsplash 等外链。
 * 文档：https://developer.qiniu.com/dora/1279/basic-processing-images-imageview2
 */

const QINIU_HOSTS = new Set(['img.yzre.cn'])
const QINIU_HOST_SUFFIXES = ['.qiniucdn.com', '.clouddn.com', '.qnssl.com', '.qbox.me']

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
  // 剔除 imageView2 / imageslim，保留其它业务参数
  const kept = query
    .split('&')
    .filter((part) => part && !part.startsWith('imageView2') && part !== 'imageslim')
    .join('&')
  return kept ? `${base}?${kept}` : base
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

/** 列表缩略图：瀑布流栏宽约 300–500 CSS 像素，2x 屏约需 600–1000 */
export function buildPhotoThumbUrl(url: string): string {
  return buildQiniuImageUrl(url, { width: 640, quality: 62, format: 'webp' })
}

/** 灯箱全屏预览：远小于 4k 原图 */
export function buildPhotoPreviewUrl(url: string): string {
  return buildQiniuImageUrl(url, { width: 1600, quality: 75, format: 'webp' })
}

/** 封面主视觉：中等宽度，避免拉原图 */
export function buildPhotoHeroUrl(url: string): string {
  return buildQiniuImageUrl(url, { width: 1400, quality: 70, format: 'webp' })
}
