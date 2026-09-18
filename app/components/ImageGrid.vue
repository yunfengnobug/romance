<script setup lang="ts">
const props = defineProps<{
  images: string[]
}>()

const emit = defineEmits(['preview'])

// 按微信朋友圈习惯决定宫格列数：1 张独占，2/4 张两列，其余三列
const columns = computed(() => {
  const count = props.images.length
  if (count === 1) return 1
  if (count === 2 || count === 4) return 2
  return 3
})

// 点击图片打开预览
function onPreview(src: string) {
  emit('preview', src)
}
</script>

<template>
  <div
    v-if="images.length"
    class="image-grid"
    :class="`image-grid--cols-${columns}`"
    :data-count="images.length"
  >
    <button
      v-for="(src, index) in images"
      :key="`${src}-${index}`"
      type="button"
      class="image-grid__cell"
      @click="onPreview(src)"
    >
      <img :src="src" :alt="`图片 ${index + 1}`" class="image-grid__img" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
.image-grid {
  display: grid;
  gap: 4px;
  margin-top: 8px;

  &--cols-1 {
    max-width: 240px;
    grid-template-columns: 1fr;

    .image-grid__cell {
      aspect-ratio: auto;
      min-height: 140px;
      max-height: 280px;
    }

    .image-grid__img {
      object-fit: contain;
      background: $color-like-bg;
    }
  }

  &--cols-2 {
    max-width: 248px;
    grid-template-columns: 1fr 1fr;
  }

  &--cols-3 {
    max-width: 372px;
    grid-template-columns: 1fr 1fr 1fr;
  }

  &__cell {
    padding: 0;
    border: 0;
    background: $color-like-bg;
    overflow: hidden;
    cursor: pointer;
    aspect-ratio: 1;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}
</style>
