<script setup lang="ts">
const emit = defineEmits(['close', 'published'])

const text = ref('')
const location = ref('')
const files = ref<File[]>([])
const previews = ref<string[]>([])
const videoFile = ref<File | null>(null)
const videoPreview = ref('')
const videoDuration = ref(0)
const error = ref('')
const pending = ref(false)
const progress = ref('')
const imageInput = ref<HTMLInputElement | null>(null)
const videoInput = ref<HTMLInputElement | null>(null)

const canPublish = computed(() => {
  return Boolean(text.value.trim() || files.value.length || videoFile.value)
})

const remainingSlots = computed(() => MOMENT_MAX_IMAGES - files.value.length)

function revoke(url: string) {
  if (url) URL.revokeObjectURL(url)
}

function clearImages() {
  previews.value.forEach(revoke)
  files.value = []
  previews.value = []
}

function clearVideo() {
  revoke(videoPreview.value)
  videoFile.value = null
  videoPreview.value = ''
  videoDuration.value = 0
}

function isAllowedVideo(file: File) {
  const type = (file.type || '').toLowerCase()
  if (type.startsWith('video/')) return true
  return /\.(mp4|mov|m4v|webm|3gp)$/i.test(file.name || '')
}

function readVideoMeta(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const el = document.createElement('video')
    el.preload = 'metadata'
    el.onloadedmetadata = () => {
      const duration = Number(el.duration) || 0
      URL.revokeObjectURL(url)
      resolve(duration)
    }
    el.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法读取视频，请换一个文件'))
    }
    el.src = url
  })
}

async function captureVideoPoster(file: File): Promise<File | null> {
  const url = URL.createObjectURL(file)
  try {
    const el = document.createElement('video')
    el.muted = true
    el.playsInline = true
    el.preload = 'auto'
    await new Promise<void>((resolve, reject) => {
      el.onloadeddata = () => resolve()
      el.onerror = () => reject(new Error('poster'))
      el.src = url
    })
    try {
      el.currentTime = Math.min(1, Math.max(0.1, (Number(el.duration) || 1) * 0.08))
      await new Promise<void>((resolve) => {
        el.onseeked = () => resolve()
        setTimeout(() => resolve(), 400)
      })
    }
    catch {
      // 部分格式不允许 seek，用第一帧
    }
    const canvas = document.createElement('canvas')
    const w = el.videoWidth || 720
    const h = el.videoHeight || 960
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(el, 0, 0, w, h)
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.82))
    if (!blob) return null
    return new File([blob], 'cover.jpg', { type: 'image/jpeg' })
  }
  catch {
    return null
  }
  finally {
    URL.revokeObjectURL(url)
  }
}

function onPickImages(event: Event) {
  const input = event.target as HTMLInputElement
  const picked = Array.from(input.files || [])
  input.value = ''
  if (!picked.length) return
  error.value = ''
  if (videoFile.value) clearVideo()
  const room = remainingSlots.value
  const next = picked.filter((file) => file.type.startsWith('image/') || !file.type).slice(0, room)
  files.value = files.value.concat(next)
  previews.value = previews.value.concat(next.map((file) => URL.createObjectURL(file)))
}

async function onPickVideo(event: Event) {
  const input = event.target as HTMLInputElement
  const file = (input.files || [])[0]
  input.value = ''
  if (!file) return
  error.value = ''
  if (!isAllowedVideo(file)) {
    error.value = '请选择 mp4 / mov / webm 视频'
    return
  }
  if (file.size > MOMENT_VIDEO_MAX_BYTES) {
    error.value = `视频不能超过 ${Math.round(MOMENT_VIDEO_MAX_BYTES / (1024 * 1024))}MB`
    return
  }
  try {
    const duration = await readVideoMeta(file)
    if (duration > MOMENT_VIDEO_MAX_SECONDS + 0.4) {
      error.value = `视频不能超过 ${MOMENT_VIDEO_MAX_SECONDS} 秒`
      return
    }
    clearImages()
    clearVideo()
    videoFile.value = file
    videoPreview.value = URL.createObjectURL(file)
    videoDuration.value = duration
  }
  catch (err: any) {
    error.value = readErrorMessage(err) || '无法读取视频'
  }
}

function removeImage(index: number) {
  const url = previews.value[index]
  if (url) revoke(url)
  files.value.splice(index, 1)
  previews.value.splice(index, 1)
}

function openImagePicker() {
  imageInput.value?.click()
}

function openVideoPicker() {
  videoInput.value?.click()
}

async function publish() {
  if (!canPublish.value || pending.value) return
  error.value = ''
  pending.value = true
  try {
    const images: string[] = []
    let video = ''
    let videoCover = ''
    if (videoFile.value) {
      progress.value = '正在上传视频…'
      video = await uploadMomentFile(videoFile.value)
      progress.value = '正在生成封面…'
      const poster = await captureVideoPoster(videoFile.value)
      if (poster) {
        progress.value = '正在上传封面…'
        videoCover = await uploadMomentFile(poster)
      }
    }
    else {
      for (let i = 0; i < files.value.length; i++) {
        progress.value = `正在上传图片 ${i + 1}/${files.value.length}`
        images.push(await uploadMomentImage(files.value[i]))
      }
    }
    progress.value = '正在发表…'
    const created = await createMomentPost({
      text: text.value.trim(),
      images,
      location: location.value.trim(),
      video,
      videoCover,
      videoDuration: videoDuration.value || undefined,
    })
    emit('published', created)
  }
  catch (err: any) {
    error.value = readErrorMessage(err)
    pending.value = false
    progress.value = ''
  }
}

onUnmounted(() => {
  previews.value.forEach(revoke)
  revoke(videoPreview.value)
})
</script>

<template>
  <Teleport to="body">
    <div class="composer" role="dialog" aria-modal="true" aria-labelledby="composer-title">
      <header class="composer__bar">
        <button type="button" class="composer__cancel" :disabled="pending" @click="emit('close')">取消</button>
        <h2 id="composer-title" class="composer__title">发朋友圈</h2>
        <button
          type="button"
          class="composer__send"
          :class="{ 'is-ready': canPublish && !pending }"
          :disabled="!canPublish || pending"
          @click="publish"
        >
          {{ pending ? '发表中' : '发表' }}
        </button>
      </header>

      <div class="composer__body">
        <textarea
          v-model="text"
          class="composer__text"
          rows="5"
          maxlength="2000"
          placeholder="这一刻的想法…"
          :disabled="pending"
        />

        <div v-if="videoFile" class="composer__video">
          <video :src="videoPreview" class="composer__video-el" muted playsinline />
          <button
            type="button"
            class="composer__remove"
            :disabled="pending"
            aria-label="移除视频"
            @click="clearVideo"
          >
            ×
          </button>
          <p class="composer__video-hint">
            {{ Math.max(1, Math.round(videoDuration || 1)) }} 秒 · 最多 {{ MOMENT_VIDEO_MAX_SECONDS }} 秒
          </p>
        </div>

        <div v-else class="composer__grid">
          <div v-for="(src, index) in previews" :key="src" class="composer__cell">
            <img :src="src" alt="" class="composer__thumb" />
            <button
              type="button"
              class="composer__remove"
              :disabled="pending"
              aria-label="移除图片"
              @click="removeImage(index)"
            >
              ×
            </button>
          </div>
          <button
            v-if="previews.length < MOMENT_MAX_IMAGES"
            type="button"
            class="composer__add"
            :disabled="pending"
            aria-label="添加图片"
            @click="openImagePicker"
          >
            <span>+</span>
          </button>
        </div>

        <div class="composer__tools">
          <button type="button" class="composer__tool" :disabled="pending || Boolean(videoFile)" @click="openImagePicker">
            图片
          </button>
          <button type="button" class="composer__tool" :disabled="pending || files.length > 0" @click="openVideoPicker">
            视频
          </button>
          <span class="composer__tool-note">图片最多 9 张；视频与图片不能同时发</span>
        </div>

        <label class="composer__loc">
          <span class="composer__pin" aria-hidden="true">📍</span>
          <input
            v-model="location"
            type="text"
            class="composer__loc-input"
            placeholder="所在位置"
            maxlength="80"
            :disabled="pending"
          />
        </label>

        <p v-if="progress" class="composer__progress">{{ progress }}</p>
        <p v-if="error" class="composer__error">{{ error }}</p>
      </div>

      <input
        ref="imageInput"
        class="composer__file"
        type="file"
        accept="image/*"
        multiple
        @change="onPickImages"
      />
      <input
        ref="videoInput"
        class="composer__file"
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.webm,.m4v"
        @change="onPickVideo"
      />
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.composer {
  position: fixed;
  inset: 0;
  z-index: 92;
  background: $color-paper;
  display: flex;
  flex-direction: column;

  &__bar {
    height: 52px;
    padding: 0 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid $color-line;
    flex-shrink: 0;
  }

  &__cancel,
  &__send {
    min-width: 64px;
    height: 36px;
    border: 0;
    background: transparent;
    font-size: 16px;
    cursor: pointer;
  }

  &__cancel {
    color: $color-ink;
  }

  &__title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  &__send {
    color: #fff;
    background: #c8c4be;
    border-radius: 6px;
    font-size: 15px;

    &.is-ready {
      background: $color-maple;
    }

    &:disabled {
      cursor: default;
    }
  }

  &__body {
    flex: 1;
    overflow: auto;
    padding: 16px 18px 32px;
    max-width: 680px;
    width: 100%;
    margin: 0 auto;
  }

  &__text {
    width: 100%;
    border: 0;
    resize: none;
    font-size: 16px;
    line-height: 1.6;
    color: $color-ink;
    background: transparent;
    font-family: inherit;

    &:focus {
      outline: none;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    max-width: 360px;
    margin-top: 12px;
  }

  &__cell,
  &__add {
    position: relative;
    aspect-ratio: 1;
    background: $color-like-bg;
    overflow: hidden;
  }

  &__thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__remove {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 22px;
    height: 22px;
    border: 0;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    z-index: 1;
  }

  &__add {
    border: 0;
    color: #b4aaa2;
    font-size: 42px;
    cursor: pointer;
  }

  &__video {
    position: relative;
    margin-top: 12px;
    max-width: 280px;
    background: #1a1614;
  }

  &__video-el {
    display: block;
    width: 100%;
    max-height: 360px;
    background: #000;
  }

  &__video-hint {
    margin: 8px 0 0;
    font-size: 12px;
    color: $color-muted;
  }

  &__tools {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
  }

  &__tool {
    border: 0;
    background: $color-like-bg;
    color: $color-wechat;
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 13px;
    cursor: pointer;

    &:disabled {
      opacity: 0.45;
      cursor: default;
    }
  }

  &__tool-note {
    font-size: 12px;
    color: $color-muted;
  }

  &__loc {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 0;
    border-top: 1px solid $color-line;
    border-bottom: 1px solid $color-line;
  }

  &__pin {
    font-size: 14px;
  }

  &__loc-input {
    flex: 1;
    border: 0;
    background: transparent;
    font-size: 15px;
    color: $color-wechat;

    &:focus {
      outline: none;
    }
  }

  &__progress,
  &__error {
    margin: 14px 0 0;
    font-size: 13px;
  }

  &__progress {
    color: $color-muted;
  }

  &__error {
    color: $color-maple-deep;
  }

  &__file {
    display: none;
  }
}
</style>
