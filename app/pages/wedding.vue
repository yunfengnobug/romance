<script setup lang="ts">
import { weddingCategories as mockCategories, weddingHero, weddingPhotos as mockPhotos, weddingStory } from '~~/data/wedding'

useHead({
  title: '婚纱照 · 我们的故事',
})

const emptyAlbum = () => ({ cover: '', categories: [], photos: [], waiting: false })

const album = ref(emptyAlbum())
const loading = ref(true)
const loadError = ref('')
const usingMock = ref(false)
const activeGroup = ref('all')
const previewSrc = ref('')

// 封面：接口 cover，否则第一张照片
const coverSrc = computed(() => pickWeddingCover(album.value))

// Tab = 全部 + 后台分类 label，不在前端写死分组名
const groups = computed(() => [
  { key: 'all', label: '全部' },
  ...album.value.categories.map((item: any) => ({
    key: item.tabKey || item.id || item.slug,
    label: item.label,
  })),
])

// 按当前分类过滤（对照 category id 或 slug）
const filteredPhotos = computed(() => {
  if (activeGroup.value === 'all') return album.value.photos
  return album.value.photos.filter((item: any) => photoMatchesGroup(item, activeGroup.value))
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

// 当前选中的分类如果已被后台删掉，回到全部
function ensureActiveGroup() {
  const keys = groups.value.map((item: any) => item.key)
  if (!keys.includes(activeGroup.value)) activeGroup.value = 'all'
}

async function loadAlbum() {
  loading.value = true
  loadError.value = ''
  usingMock.value = false

  if (weddingUseMock()) {
    album.value = albumFromMock(mockCategories, mockPhotos)
    usingMock.value = true
    ensureActiveGroup()
    loading.value = false
    return
  }

  try {
    album.value = await fetchWeddingAlbum()
    loadError.value = ''
  }
  catch (err: any) {
    album.value = emptyAlbum()
    loadError.value = readErrorMessage(err)
  }
  finally {
    ensureActiveGroup()
    loading.value = false
  }
}

onMounted(() => {
  loadAlbum()
})
</script>

<template>
  <div class="wedding">
    <section class="wedding__hero">
      <img v-if="coverSrc" :src="coverSrc" :alt="weddingHero.title" class="wedding__hero-img" />
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
      <p v-if="usingMock" class="wedding__banner">
        正在显示本地示例。线上分类由后台配置，不使用这份 mock 分组名。
      </p>
      <p v-else-if="album.waiting" class="wedding__banner">
        相册准备中，敬请期待。
      </p>
      <div v-if="groups.length > 1" class="wedding__tabs" role="tablist">
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

      <p v-if="loading" class="wedding__empty">正在加载相册…</p>
      <div v-else-if="loadError" class="wedding__empty">
        <p>{{ loadError }}</p>
        <button type="button" class="wedding__retry" @click="loadAlbum">重试</button>
      </div>
      <div v-else-if="filteredPhotos.length" class="wedding__grid">
        <button
          v-for="photo in filteredPhotos"
          :key="photo.id"
          type="button"
          class="wedding__cell"
          @click="openPreview(photo.src)"
        >
          <img :src="photo.src" :alt="photo.alt" loading="lazy" />
        </button>
      </div>
      <p v-else-if="!album.waiting" class="wedding__empty">
        {{ activeGroup === 'all' ? '相册准备中，敬请期待。' : '这一组暂无照片，敬请期待。' }}
      </p>
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

  &__banner {
    margin: 0 0 16px;
    padding: 8px 10px;
    border-radius: 6px;
    background: $color-like-bg;
    color: $color-muted;
    font-size: 12px;
    line-height: 1.5;
    text-align: center;

    code {
      font-size: 11px;
    }
  }

  &__tabs {
    display: flex;
    flex-wrap: wrap;
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

  &__retry {
    margin-top: 12px;
    border: 0;
    background: $color-maple;
    color: #fff;
    border-radius: 8px;
    padding: 8px 16px;
    cursor: pointer;
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
