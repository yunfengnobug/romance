<script setup lang="ts">
import { momentsPosts, momentsProfile } from '~~/data/moments'

useHead({
  title: '朋友圈 · 云枫',
})

// 灯箱当前图片，空字符串表示关闭
const previewSrc = ref('')

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
  <div class="moments">
    <div class="moments__phone">
      <section class="moments__cover">
        <img :src="momentsProfile.cover" alt="朋友圈封面" class="moments__cover-img" />
        <div class="moments__identity">
          <div class="moments__who">
            <p class="moments__nickname">{{ momentsProfile.nickname }}</p>
            <p class="moments__sign">{{ momentsProfile.signature }}</p>
          </div>
          <img :src="momentsProfile.avatar" :alt="momentsProfile.nickname" class="moments__avatar" />
        </div>
      </section>

      <section v-if="momentsPosts.length" class="moments__feed">
        <MomentPost
          v-for="post in momentsPosts"
          :key="post.id"
          :post="post"
          @preview="openPreview"
        />
      </section>
      <p v-else class="moments__empty">还没有动态，稍后会从接口里取来。</p>
    </div>

    <ImageLightbox v-if="previewSrc" :src="previewSrc" @close="closePreview" />
  </div>
</template>

<style lang="scss" scoped>
.moments {
  padding: 0 0 24px;

  &__phone {
    max-width: $moments-width;
    margin: 0 auto;
    background: $color-paper;
    min-height: calc(100vh - $header-height - 80px);
    box-shadow: 0 0 0 1px $color-line;
  }

  &__cover {
    position: relative;
    height: 240px;
    background: #c9b8a8;
  }

  &__cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__identity {
    position: absolute;
    right: 16px;
    bottom: -28px;
    display: flex;
    align-items: flex-end;
    gap: 10px;
  }

  &__who {
    text-align: right;
    padding-bottom: 36px;
    color: #fff;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
  }

  &__nickname {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.12em;
  }

  &__sign {
    margin: 4px 0 0;
    font-size: 12px;
    opacity: 0.92;
  }

  &__avatar {
    width: 72px;
    height: 72px;
    border-radius: 8px;
    object-fit: cover;
    border: 2px solid $color-paper;
    background: $color-like-bg;
  }

  &__feed {
    padding-top: 40px;
  }

  &__empty {
    padding: 64px 24px;
    text-align: center;
    color: $color-muted;
    font-size: 14px;
  }
}

@media (min-width: 680px) {
  .moments {
    padding: 16px 16px 24px;

    &__cover {
      height: 280px;
    }
  }
}
</style>
