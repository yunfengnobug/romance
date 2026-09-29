<script setup lang="ts">
const props = defineProps<{
  src: string
}>()

// 灯箱展示图：七牛域名套 1600w webp，外链原样
const displaySrc = computed(() => buildPhotoPreviewUrl(props.src))

const emit = defineEmits(['close'])

// 关闭全屏预览
function close() {
  emit('close')
}

// 按 Esc 关闭
function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <div class="lightbox" role="dialog" aria-modal="true" @click="close">
      <button type="button" class="lightbox__close" aria-label="关闭预览" @click="close">
        ×
      </button>
      <img :src="displaySrc" alt="预览图片" class="lightbox__img" @click.stop />
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(20, 16, 14, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px 16px;

  &__close {
    position: absolute;
    top: 12px;
    right: 16px;
    border: 0;
    background: transparent;
    color: #fff;
    font-size: 36px;
    line-height: 1;
    cursor: pointer;
  }

  &__img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}
</style>
