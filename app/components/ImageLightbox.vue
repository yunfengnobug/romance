<script setup lang="ts">
const props = withDefaults(defineProps<{
  images: string[]
  index?: number
  alts?: string[]
}>(), {
  index: 0,
  alts: () => [],
})

const emit = defineEmits(['close'])

const rootRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)

// 灯箱请求宽 ≈ 视口内容区 × dpr × 1.2，步进封顶
const previewWidth = usePhotoDisplayWidth(rootRef, {
  fallback: QINIU_FALLBACK_PREVIEW,
  estimate: measureViewportCssWidth,
  measure: measureContentCssWidth,
})

const current = ref(0)
const ready = ref(false)
const failed = ref(false)
const frameWidth = ref(0)
const frameHeight = ref(0)
const holdSrc = ref('')
const holdStyle = ref<any>(null)

// 打开时的一组图（相册当前分组，或这一条朋友圈），空地址丢掉
const slides = computed(() => {
  const images = Array.isArray(props.images) ? props.images : []
  return images
    .map((src, index) => ({
      src: String(src || '').trim(),
      alt: String(props.alts?.[index] || '').trim() || '预览图片',
    }))
    .filter(item => item.src)
})

const total = computed(() => slides.value.length)
const hasMany = computed(() => total.value > 1)
const active = computed(() => slides.value[current.value] || null)
const displaySrc = computed(() => (active.value ? buildPhotoPreviewUrl(active.value.src, previewWidth.value) : ''))
const currentAlt = computed(() => active.value?.alt || '预览图片')
const canPrev = computed(() => current.value > 0)
const canNext = computed(() => current.value < total.value - 1)

const frameStyle = computed(() => {
  if (!frameWidth.value || !frameHeight.value) return undefined
  return {
    width: `${frameWidth.value}px`,
    height: `${frameHeight.value}px`,
  }
})

// 父组件换了一组图时，从传入的序号重新开始
watch(
  () => {
    const list = Array.isArray(props.images) ? props.images : []
    return `${props.index ?? 0}::${list.map(item => String(item || '')).join('\n')}`
  },
  () => {
    current.value = clampIndex(props.index ?? 0, slides.value.length)
    ready.value = false
    failed.value = false
    frameWidth.value = 0
    frameHeight.value = 0
    holdSrc.value = ''
    holdStyle.value = null
  },
  { immediate: true },
)

// 相邻两张先拉下来，翻页时少等一会儿
watch([current, previewWidth, slides], () => {
  if (!import.meta.client) return
  const neighbors = [slides.value[current.value - 1], slides.value[current.value + 1]]
  for (const item of neighbors) {
    if (!item?.src) continue
    const img = new Image()
    img.src = buildPhotoPreviewUrl(item.src, previewWidth.value)
  }
}, { immediate: true })

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0
  const n = Number(index)
  if (!Number.isFinite(n)) return 0
  return Math.min(length - 1, Math.max(0, Math.trunc(n)))
}

function isCurrentImage(img: HTMLImageElement) {
  return !imgRef.value || img === imgRef.value
}

// 缓存图可能在 ref 写上之前就 load 完，这里再认一次
function revealIfComplete() {
  const img = imgRef.value
  if (!img || failed.value) return
  if (img.complete && img.naturalWidth) {
    fitImage(img)
    return
  }
  if (img.complete && !img.naturalWidth) {
    failed.value = true
    ready.value = true
  }
}

// 按舞台大小等比放下，不裁切；小图也会放大到能看清
function fitImage(img: HTMLImageElement, attempt = 0) {
  if (!isCurrentImage(img)) return
  const stage = stageRef.value
  const bounds = stage?.getBoundingClientRect()
  const nw = img.naturalWidth
  const nh = img.naturalHeight
  const missing = !stage || !bounds || bounds.width < 2 || bounds.height < 2 || !nw || !nh
  if (missing && attempt < 8) {
    requestAnimationFrame(() => fitImage(img, attempt + 1))
    return
  }
  if (!isCurrentImage(img)) return
  if (!stage || !bounds || !nw || !nh || bounds.width < 2 || bounds.height < 2) {
    ready.value = true
    return
  }

  let width = 0
  let height = 0
  if (nw / nh > bounds.width / bounds.height) {
    width = Math.floor(bounds.width)
    height = Math.max(1, Math.floor((width * nh) / nw))
  }
  else {
    height = Math.floor(bounds.height)
    width = Math.max(1, Math.floor((height * nw) / nh))
  }
  frameWidth.value = Math.min(width, Math.floor(bounds.width))
  frameHeight.value = Math.min(height, Math.floor(bounds.height))
  ready.value = true
}

function refit() {
  const img = imgRef.value
  if (!img || failed.value || !img.naturalWidth) return
  fitImage(img)
}

function onImageLoad(event: Event) {
  const img = event.target as HTMLImageElement | null
  if (!img || !isCurrentImage(img)) return
  failed.value = false
  fitImage(img)
}

function onImageError(event: Event) {
  const img = event.target as HTMLImageElement | null
  if (!img || !isCurrentImage(img)) return
  failed.value = true
  ready.value = true
  frameWidth.value = 0
  frameHeight.value = 0
}

// 关闭全屏预览
function close() {
  emit('close')
}

function rememberCurrentFrame() {
  // 新图还没显示完就连着翻时，继续留着上一张已经看清的图
  if (!displaySrc.value || !ready.value || failed.value) return
  holdSrc.value = displaySrc.value
  holdStyle.value = frameWidth.value
    ? { width: `${frameWidth.value}px`, height: `${frameHeight.value}px` }
    : null
}

// 翻页时先留着上一张，新图好了再换，避免闪一下空底
function go(index: number) {
  if (index < 0 || index >= total.value || index === current.value) return
  rememberCurrentFrame()
  ready.value = false
  failed.value = false
  frameWidth.value = 0
  frameHeight.value = 0
  current.value = index
}

watch(ready, (value) => {
  if (!value) return
  holdSrc.value = ''
  holdStyle.value = null
})

function prev() {
  if (!canPrev.value) return
  go(current.value - 1)
}

function next() {
  if (!canNext.value) return
  go(current.value + 1)
}

// 滑动结束后浏览器还会补一次 click，避免松手时误关闭或连翻
let swipeLock = false
let swipeTimer = 0

function armSwipeLock() {
  swipeLock = true
  window.clearTimeout(swipeTimer)
  swipeTimer = window.setTimeout(() => {
    swipeLock = false
  }, 400)
}

function consumeSwipeClick() {
  if (!swipeLock) return false
  swipeLock = false
  window.clearTimeout(swipeTimer)
  return true
}

function onPrevClick(event: MouseEvent) {
  event.stopPropagation()
  if (consumeSwipeClick()) return
  prev()
}

function onNextClick(event: MouseEvent) {
  event.stopPropagation()
  if (consumeSwipeClick()) return
  next()
}

function onCloseClick(event: MouseEvent) {
  event.stopPropagation()
  if (consumeSwipeClick()) return
  close()
}

function onBackdropClick() {
  if (consumeSwipeClick()) return
  close()
}

// 按 Esc 关闭，左右方向键在当前这组里翻页
function onKey(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
  if (event.key === 'Tab') {
    trapTab(event)
    return
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prev()
    return
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    next()
  }
}

// 焦点留在灯箱里，避免 Tab 到后面的页面
function trapTab(event: KeyboardEvent) {
  const root = rootRef.value
  if (!root) return
  const items = [...root.querySelectorAll<HTMLElement>('button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])')]
  if (!items.length) {
    event.preventDefault()
    return
  }
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement
  if (event.shiftKey && (active === first || !root.contains(active))) {
    event.preventDefault()
    last.focus()
    return
  }
  if (!event.shiftKey && (active === last || !root.contains(active))) {
    event.preventDefault()
    first.focus()
  }
}

let tracking = false
let pointerId = -1
let startX = 0
let startY = 0

function onPointerDown(event: PointerEvent) {
  if (!event.isPrimary) return
  if (event.pointerType === 'mouse' && event.button !== 0) return
  const target = event.target as Element | null
  if (target?.closest('button')) return
  tracking = true
  pointerId = event.pointerId
  startX = event.clientX
  startY = event.clientY
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerCancel)
}

// 向左滑看下一张，向右滑看上一张；竖滑不当作翻页
function onPointerUp(event: PointerEvent) {
  if (!tracking || event.pointerId !== pointerId) return
  endTracking()
  const dx = event.clientX - startX
  const dy = event.clientY - startY
  if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.15) return
  armSwipeLock()
  if (dx < 0) next()
  else prev()
}

function onPointerCancel(event: PointerEvent) {
  if (event.pointerId !== pointerId) return
  endTracking()
}

function endTracking() {
  tracking = false
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerCancel)
}

let lockedScrollY = 0
let returnFocus: HTMLElement | null = null
const savedBody: Record<string, string> = {}
const bodyStyleKeys = ['position', 'top', 'left', 'right', 'width', 'overflow'] as const
let stageObserver: ResizeObserver | null = null

function lockScroll() {
  lockedScrollY = window.scrollY || 0
  for (const key of bodyStyleKeys) savedBody[key] = document.body.style[key]
  document.body.style.position = 'fixed'
  document.body.style.top = `-${lockedScrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
  document.body.style.overflow = 'hidden'
}

function unlockScroll() {
  for (const key of bodyStyleKeys) document.body.style[key] = savedBody[key] || ''
  window.scrollTo(0, lockedScrollY)
}

onMounted(() => {
  const activeEl = document.activeElement
  if (activeEl instanceof HTMLElement && activeEl !== document.body) returnFocus = activeEl
  lockScroll()
  window.addEventListener('keydown', onKey)
  if (stageRef.value && typeof ResizeObserver !== 'undefined') {
    stageObserver = new ResizeObserver(() => refit())
    stageObserver.observe(stageRef.value)
  }
  nextTick(() => {
    rootRef.value?.focus()
    revealIfComplete()
  })
})

watch(displaySrc, () => {
  nextTick(() => revealIfComplete())
})

onBeforeUnmount(() => {
  window.clearTimeout(swipeTimer)
  endTracking()
  stageObserver?.disconnect()
  window.removeEventListener('keydown', onKey)
  unlockScroll()
  returnFocus?.focus()
})
</script>

<template>
  <Teleport to="body">
    <div
      ref="rootRef"
      class="lightbox"
      :class="{ 'lightbox--many': hasMany }"
      role="dialog"
      aria-modal="true"
      aria-label="图片预览"
      tabindex="-1"
      @click="onBackdropClick"
      @pointerdown="onPointerDown"
    >
      <button type="button" class="lightbox__close" aria-label="关闭预览" @click="onCloseClick">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"
          />
        </svg>
      </button>

      <button
        v-if="hasMany"
        type="button"
        class="lightbox__nav lightbox__nav--prev"
        :disabled="!canPrev"
        aria-label="上一张"
        @click="onPrevClick"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14.5 6.5 8.5 12l6 5.5"
          />
        </svg>
      </button>

      <div ref="stageRef" class="lightbox__stage">
        <img
          v-if="holdSrc"
          class="lightbox__img is-ready"
          :src="holdSrc"
          alt=""
          aria-hidden="true"
          :style="holdStyle"
          draggable="false"
          @click.stop
        />
        <img
          v-if="displaySrc && !failed"
          ref="imgRef"
          :key="current"
          :src="displaySrc"
          :alt="currentAlt"
          class="lightbox__img"
          :class="{ 'is-ready': ready }"
          :style="frameStyle"
          draggable="false"
          @load="onImageLoad"
          @error="onImageError"
          @click.stop
        />
        <span v-if="!ready && !failed && !holdSrc" class="lightbox__wait" aria-hidden="true" />
        <p v-if="failed" class="lightbox__error" @click.stop>这张图片暂时无法打开</p>
      </div>

      <button
        v-if="hasMany"
        type="button"
        class="lightbox__nav lightbox__nav--next"
        :disabled="!canNext"
        aria-label="下一张"
        @click="onNextClick"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.5 6.5 15.5 12l-6 5.5"
          />
        </svg>
      </button>

      <p v-if="hasMany" class="lightbox__count" aria-live="polite" @click.stop>
        {{ current + 1 }} / {{ total }}
      </p>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(24, 16, 14, 0.94);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  cursor: zoom-out;
  touch-action: none;
  user-select: none;

  &:focus {
    outline: none;
  }

  &__close,
  &__nav {
    position: absolute;
    z-index: 2;
    width: 44px;
    height: 44px;
    padding: 0;
    display: grid;
    place-items: center;
    border-radius: 999px;
    border: 1px solid rgba($color-maple, 0.72);
    background: rgba(28, 20, 18, 0.55);
    color: $color-paper;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(12, 8, 6, 0.22);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);

    svg {
      width: 22px;
      height: 22px;
      display: block;
    }

    &:focus-visible {
      outline: 2px solid $color-paper;
      outline-offset: 2px;
    }

    &:active:not(:disabled) {
      background: $color-maple-deep;
      border-color: $color-maple-deep;
      color: #fff;
    }

    &:disabled {
      opacity: 0.32;
      cursor: default;
    }
  }

  &__close {
    top: calc(12px + env(safe-area-inset-top, 0px));
    right: calc(12px + env(safe-area-inset-right, 0px));
  }

  &__nav--prev {
    left: calc(14px + env(safe-area-inset-left, 0px));
  }

  &__nav--next {
    right: calc(14px + env(safe-area-inset-right, 0px));
  }

  &__nav {
    top: 50%;
    transform: translateY(-50%);
  }

  &__stage {
    position: absolute;
    z-index: 1;
    top: calc(60px + env(safe-area-inset-top, 0px));
    right: calc(16px + env(safe-area-inset-right, 0px));
    bottom: calc(20px + env(safe-area-inset-bottom, 0px));
    left: calc(16px + env(safe-area-inset-left, 0px));
  }

  &--many &__stage {
    bottom: calc(60px + env(safe-area-inset-bottom, 0px));
  }

  &__img {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    cursor: default;
    opacity: 0;
    box-shadow:
      0 0 0 1px rgba($color-paper, 0.16),
      0 18px 48px rgba(8, 4, 2, 0.38);

    &.is-ready {
      opacity: 1;
    }
  }

  &__wait {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 32px;
    height: 32px;
    margin: -16px 0 0 -16px;
    border-radius: 50%;
    border: 2px solid rgba($color-paper, 0.28);
    border-top-color: $color-maple;
    animation: lightbox-spin 0.8s linear infinite;
  }

  &__error {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    max-width: 16em;
    color: $color-paper;
    font-size: 14px;
    letter-spacing: 0.06em;
    text-align: center;
    cursor: default;
  }

  &__count {
    position: absolute;
    z-index: 2;
    left: 50%;
    bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    transform: translateX(-50%);
    margin: 0;
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid rgba($color-maple, 0.5);
    background: rgba(28, 20, 18, 0.55);
    color: $color-paper;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.08em;
    font-variant-numeric: tabular-nums;
    line-height: 1.4;
    cursor: default;
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
  }
}

@media (hover: hover) {
  .lightbox {
    &__close:hover:not(:disabled),
    &__nav:hover:not(:disabled) {
      background: $color-maple;
      border-color: $color-maple;
      color: #fff;
    }
  }
}

@media (max-width: 720px) {
  .lightbox {
    &__nav {
      top: auto;
      bottom: calc(14px + env(safe-area-inset-bottom, 0px));
      transform: none;
    }

    &__stage {
      right: calc(10px + env(safe-area-inset-right, 0px));
      left: calc(10px + env(safe-area-inset-left, 0px));
    }

    &--many &__stage {
      bottom: calc(84px + env(safe-area-inset-bottom, 0px));
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .lightbox__wait {
    animation: none;
  }
}

@keyframes lightbox-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
