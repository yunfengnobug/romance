<script setup lang="ts">
import { weddingHero, weddingPhotos, weddingStory } from '~~/data/wedding'

useHead({
  title: '婚纱照 · 云枫',
})

// 相册分组：全部 / 外景 / 室内
const groups = [
  { key: 'all', label: '全部' },
  { key: 'outdoor', label: '外景' },
  { key: 'indoor', label: '室内' },
]

// 当前选中的分组
const activeGroup = ref('all')

// 灯箱当前图片
const previewSrc = ref('')

// 按分组过滤照片
const filteredPhotos = computed(() => {
  if (activeGroup.value === 'all') return weddingPhotos
  return weddingPhotos.filter((item: any) => item.group === activeGroup.value)
})

// 切换相册分组
function selectGroup(key: string) {
  activeGroup.value = key
}

// 打开图片预览
function openPreview(src: string) {
  previewSrc.value = src
}

// 关闭图片预览
function closePreview() {
  previewSrc.value = ''
}
</script>

<template>
  <div class="wedding">
    <section class="wedding__hero">
      <img :src="weddingHero.cover" :alt="weddingHero.title" class="wedding__hero-img" />
      <div class="wedding__hero-mask">
        <h1>{{ weddingHero.title }}</h1>
        <p>{{ weddingHero.subtitle }}</p>
      </div>
    </section>

    <section class="wedding__story">
      <h2>{{ weddingStory.title }}</h2>
      <p>{{ weddingStory.text }}</p>
    </section>

    <section class="wedding__album">
      <div class="wedding__tabs" role="tablist">
        <button
          v-for="group in groups"
          :key="group.key"
          type="button"
          class="wedding__tab"
          :class="{ 'is-active': activeGroup === group.key }"
          @click="selectGroup(group.key)"
        >
          {{ group.label }}
        </button>
      </div>

      <div v-if="filteredPhotos.length" class="wedding__grid">
        <button
          v-for="photo in filteredPhotos"
          :key="photo.id"
          type="button"
          class="wedding__cell"
          @click="openPreview(photo.src)"
        >
          <img :src="photo.src" :alt="photo.alt" />
        </button>
      </div>
      <p v-else class="wedding__empty">这一组还没有照片，稍后会补上。</p>
    </section>

    <ImageLightbox v-if="previewSrc" :src="previewSrc" @close="closePreview" />
  </div>
</template>

<style lang="scss" scoped>
.wedding {
  max-width: $wedding-width;
  margin: 0 auto;
  padding-bottom: 32px;

  &__hero {
    position: relative;
    height: 280px;
    overflow: hidden;
    background: #c9b8a8;
  }

  &__hero-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__hero-mask {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to top, rgba(32, 24, 20, 0.45), rgba(32, 24, 20, 0.15));
    color: #fff;
    text-align: center;
    padding: 16px;

    h1 {
      margin: 0 0 8px;
      font-size: 36px;
      font-weight: 600;
      letter-spacing: 0.32em;
      text-indent: 0.32em;
    }

    p {
      margin: 0;
      font-size: 14px;
      letter-spacing: 0.08em;
      opacity: 0.92;
    }
  }

  &__story {
    padding: 36px 20px 12px;
    text-align: center;

    h2 {
      margin: 0 0 12px;
      font-size: 18px;
      letter-spacing: 0.2em;
      font-weight: 600;
    }

    p {
      margin: 0 auto;
      max-width: 36em;
      font-size: 15px;
      line-height: 1.9;
      color: $color-muted;
    }
  }

  &__album {
    padding: 20px 16px 0;
  }

  &__tabs {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
  }

  &__tab {
    border: 1px solid $color-line;
    background: $color-paper;
    color: $color-muted;
    padding: 6px 16px;
    border-radius: 999px;
    font-size: 13px;
    cursor: pointer;

    &.is-active {
      border-color: $color-maple;
      color: $color-maple-deep;
      background: rgba($color-maple, 0.1);
      font-weight: 600;
    }
  }

  // 多列瀑布流：横图只占一列宽，高度随比例变矮，不通栏
  &__grid {
    column-count: 2;
    column-gap: 10px;
  }

  &__cell {
    display: block;
    width: 100%;
    margin: 0 0 10px;
    padding: 0;
    border: 0;
    background: $color-like-bg;
    overflow: hidden;
    border-radius: 8px;
    cursor: zoom-in;
    break-inside: avoid;
    page-break-inside: avoid;

    img {
      display: block;
      width: 100%;
      height: auto;
      transition: opacity 0.25s ease;
    }

    &:hover img {
      opacity: 0.88;
    }
  }

  &__empty {
    padding: 48px 16px;
    text-align: center;
    color: $color-muted;
    font-size: 14px;
    background: $color-paper;
    border: 1px dashed $color-line;
    border-radius: 12px;
  }
}

@media (min-width: 720px) {
  .wedding {
    &__hero {
      height: 420px;
      border-radius: 0 0 18px 18px;
    }

    &__hero-mask h1 {
      font-size: 48px;
    }

    &__grid {
      column-count: 3;
      column-gap: 14px;
    }

    &__cell {
      margin-bottom: 14px;
    }
  }
}
</style>
