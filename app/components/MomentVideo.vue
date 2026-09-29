<script setup lang="ts">
const props = defineProps<{
  src: string
  poster?: string
}>()

const rootRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const playing = ref(false)

// 封面请求宽跟九宫格单图接近
const posterWidth = usePhotoDisplayWidth(rootRef, {
  fallback: QINIU_FALLBACK_MOMENT_THUMB,
  measure: measureCssWidth,
  estimate: () => estimateMomentsGridCellCssWidth(1),
})

const posterSrc = computed(() => {
  const uploaded = String(props.poster || '').trim()
  if (uploaded) return buildPhotoThumbUrl(uploaded, posterWidth.value)
  return buildQiniuVideoPosterUrl(props.src, posterWidth.value)
})

function play() {
  playing.value = true
  nextTick(() => {
    const el = videoRef.value
    if (!el) return
    el.play().catch(() => {})
  })
}

function onEnded() {
  playing.value = false
}

function onPause() {
  const el = videoRef.value
  if (el && el.ended) playing.value = false
}
</script>

<template>
  <div ref="rootRef" class="moment-video">
    <video
      v-if="playing"
      ref="videoRef"
      class="moment-video__player"
      :src="src"
      :poster="posterSrc || undefined"
      controls
      playsinline
      @ended="onEnded"
      @pause="onPause"
    />
    <button
      v-else
      type="button"
      class="moment-video__poster"
      aria-label="播放视频"
      @click="play"
    >
      <img v-if="posterSrc" :src="posterSrc" alt="" class="moment-video__img" />
      <span class="moment-video__play" aria-hidden="true">▶</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.moment-video {
  margin-top: 8px;
  max-width: 240px;
  background: #1a1614;
  overflow: hidden;

  &__poster,
  &__player {
    display: block;
    width: 100%;
    max-height: 320px;
    min-height: 160px;
  }

  &__poster {
    position: relative;
    padding: 0;
    border: 0;
    background: #1a1614;
    cursor: pointer;
    aspect-ratio: 3 / 4;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__player {
    background: #000;
    object-fit: contain;
  }

  &__play {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.45);
    color: #fff;
    font-size: 18px;
    line-height: 48px;
    text-indent: 3px;
    text-align: center;
    pointer-events: none;
  }
}
</style>
