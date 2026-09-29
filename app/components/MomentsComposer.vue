<script setup lang="ts">
const MAX_IMAGES = 9

const emit = defineEmits(['close', 'published'])

const text = ref('')
const location = ref('')
const files = ref<File[]>([])
const previews = ref<string[]>([])
const error = ref('')
const pending = ref(false)
const progress = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const canPublish = computed(() => {
  return Boolean(text.value.trim() || files.value.length)
})

// 选图后生成本地预览
function onPick(event: Event) {
  const input = event.target as HTMLInputElement
  const picked = Array.from(input.files || [])
  input.value = ''
  if (!picked.length) return
  const room = MAX_IMAGES - files.value.length
  const next = picked.slice(0, room)
  files.value = files.value.concat(next)
  previews.value = previews.value.concat(next.map((file) => URL.createObjectURL(file)))
}

function removeImage(index: number) {
  const url = previews.value[index]
  if (url) URL.revokeObjectURL(url)
  files.value.splice(index, 1)
  previews.value.splice(index, 1)
}

function openPicker() {
  fileInput.value?.click()
}

// 先逐张拿七牛凭证并上传，再发帖
async function publish() {
  if (!canPublish.value || pending.value) return
  error.value = ''
  pending.value = true
  try {
    const images: string[] = []
    for (let i = 0; i < files.value.length; i++) {
      progress.value = `正在上传图片 ${i + 1}/${files.value.length}`
      images.push(await uploadMomentImage(files.value[i]))
    }
    progress.value = '正在发表…'
    const created = await createMomentPost({
      text: text.value.trim(),
      images,
      location: location.value.trim(),
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
  previews.value.forEach((url) => URL.revokeObjectURL(url))
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

        <div class="composer__grid">
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
            v-if="previews.length < MAX_IMAGES"
            type="button"
            class="composer__add"
            :disabled="pending"
            aria-label="添加图片"
            @click="openPicker"
          >
            <span>+</span>
          </button>
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
        ref="fileInput"
        class="composer__file"
        type="file"
        accept="image/*"
        multiple
        @change="onPick"
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
  }

  &__add {
    border: 0;
    color: #b4aaa2;
    font-size: 42px;
    cursor: pointer;
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
