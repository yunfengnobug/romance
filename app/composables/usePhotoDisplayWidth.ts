/**
 * 按元素（或视口）渲染宽计算七牛 imageView2 请求宽。
 * SSR / 尚未布局时用 fallback；客户端先用页面几何估算，再读真实盒子。
 * 只升不降，避免来回换 src 造成二次请求和闪动。
 */

type MeasureFn = (el: Element | null | undefined) => number

export function usePhotoDisplayWidth(
  elementRef: MaybeRefOrGetter<Element | null | undefined>,
  options: {
    fallback: number
    measure?: MeasureFn
    estimate?: () => number
  },
) {
  const width = ref(initialDisplayWidth(options))

  function applyCss(css: number) {
    const next = resolveQiniuRequestWidth(css)
    if (next > width.value) width.value = next
  }

  function read() {
    if (typeof options.estimate === 'function') {
      applyCss(options.estimate())
    }
    const el = toValue(elementRef)
    const measure = options.measure || measureCssWidth
    applyCss(measure(el))
  }

  onMounted(() => {
    read()
    requestAnimationFrame(read)
    window.addEventListener('resize', read)
    onBeforeUnmount(() => window.removeEventListener('resize', read))
  })

  watch(
    () => toValue(elementRef),
    (el, _prev, onCleanup) => {
      if (!import.meta.client) return
      read()
      if (!el || typeof ResizeObserver === 'undefined') return
      const ro = new ResizeObserver(() => read())
      ro.observe(el)
      onCleanup(() => ro.disconnect())
    },
    { flush: 'post' },
  )

  return width
}

function initialDisplayWidth(options: { fallback: number, estimate?: () => number }): number {
  const fallback = Math.max(1, Math.round(Number(options.fallback) || 800))
  // 客户端 setup 就能按视口估算，灯箱/封面第一帧不必先用固定 1600
  if (import.meta.client && typeof options.estimate === 'function') {
    const estimated = resolveQiniuRequestWidth(options.estimate())
    if (estimated > 0) return estimated
  }
  return fallback
}

/** 封面通栏：页面最大 960，与 $wedding-width 一致 */
export function estimateWeddingHeroCssWidth(): number {
  if (typeof window === 'undefined') return 0
  return Math.min(window.innerWidth, 960)
}

/** 瀑布流单列：对齐 wedding.vue 的 2/3 列与左右 16px padding */
export function estimateWeddingColumnCssWidth(): number {
  if (typeof window === 'undefined') return 0
  const inner = Math.min(window.innerWidth, 960) - 32
  const wide = window.innerWidth >= 720
  const cols = wide ? 3 : 2
  const gap = wide ? 14 : 10
  return Math.max(0, (inner - gap * (cols - 1)) / cols)
}

export const MOMENTS_PHONE_MAX = 680

/** 朋友圈手机壳宽度：页面最大 680，与 $moments-width 一致 */
export function estimateMomentsPhoneCssWidth(): number {
  if (typeof window === 'undefined') return 0
  return Math.min(window.innerWidth, MOMENTS_PHONE_MAX)
}

/** 封面通栏 */
export function estimateMomentsCoverCssWidth(): number {
  return estimateMomentsPhoneCssWidth()
}

/** 封面右下角头像 72px */
export function estimateMomentsCoverAvatarCssWidth(): number {
  return 72
}

/** 动态流头像 42px */
export function estimateMomentsPostAvatarCssWidth(): number {
  return 42
}

/**
 * 朋友圈宫格单格 CSS 宽。对齐 ImageGrid：1 张 max 240，2/4 张 max 248 两列，其余 max 372 三列。
 * 动态正文约等于手机壳减去左右 16 + 头像 42 + 间距 10。
 */
export function estimateMomentsGridCellCssWidth(count: number): number {
  if (typeof window === 'undefined') return 0
  const n = Math.max(1, Number(count) || 1)
  const cols = n === 1 ? 1 : (n === 2 || n === 4) ? 2 : 3
  const maxW = cols === 1 ? 240 : cols === 2 ? 248 : 372
  const body = Math.max(0, estimateMomentsPhoneCssWidth() - 32 - 42 - 10)
  const gap = 4
  const gridW = Math.min(maxW, body)
  if (cols === 1) return gridW
  return Math.max(0, (gridW - gap * (cols - 1)) / cols)
}

/** 宫格 / 视频卡片：优先量第一个格子 */
export function measureGridCellCssWidth(gridEl: Element | null | undefined): number {
  if (!gridEl) return 0
  const cell = gridEl.querySelector('.image-grid__cell, .moment-video')
  if (cell) return measureCssWidth(cell)
  return measureCssWidth(gridEl)
}
