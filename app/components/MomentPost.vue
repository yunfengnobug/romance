<script setup lang="ts">
const props = defineProps<{
  post: any
  canDelete?: boolean
}>()

const emit = defineEmits(['preview', 'delete'])

// 点赞名单拼成一行
const likeText = computed(() => {
  const names = props.post.likes || []
  return names.join('、')
})

// 把点击的图片交给页面打开灯箱
function onPreview(src: string) {
  emit('preview', src)
}

// 删除前先确认，避免误触
function onDelete() {
  if (window.confirm('删除这条动态？')) emit('delete', props.post)
}
</script>

<template>
  <article class="moment-post">
    <img :src="post.avatar" :alt="post.author" class="moment-post__avatar" />
    <div class="moment-post__body">
      <h3 class="moment-post__name">{{ post.author }}</h3>
      <p v-if="post.text" class="moment-post__text">{{ post.text }}</p>
      <ImageGrid :images="post.images || []" @preview="onPreview" />
      <div class="moment-post__meta">
        <span>{{ post.time }}</span>
        <span v-if="post.location" class="moment-post__loc">{{ post.location }}</span>
        <button
          v-if="canDelete"
          type="button"
          class="moment-post__delete"
          @click="onDelete"
        >
          删除
        </button>
      </div>
      <div v-if="likeText || (post.comments && post.comments.length)" class="moment-post__panel">
        <p v-if="likeText" class="moment-post__likes">
          <span class="moment-post__heart" aria-hidden="true">♡</span>
          <span>{{ likeText }}</span>
        </p>
        <ul v-if="post.comments && post.comments.length" class="moment-post__comments">
          <li v-for="(item, index) in post.comments" :key="index" class="moment-post__comment">
            <span class="moment-post__comment-user">{{ item.user }}</span>
            <span>：</span>
            <span>{{ item.text }}</span>
          </li>
        </ul>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.moment-post {
  display: flex;
  gap: 10px;
  padding: 16px 16px 14px;
  background: $color-paper;
  border-bottom: 1px solid $color-line;

  &__avatar {
    width: 42px;
    height: 42px;
    border-radius: 6px;
    object-fit: cover;
    flex-shrink: 0;
    background: $color-like-bg;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__name {
    margin: 0 0 4px;
    font-size: 15px;
    font-weight: 600;
    color: $color-wechat;
    line-height: 1.3;
  }

  &__text {
    margin: 0;
    font-size: 15px;
    line-height: 1.55;
    color: $color-ink;
    white-space: pre-wrap;
    word-break: break-word;
  }

  &__meta {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 12px;
    color: $color-muted;
  }

  &__loc {
    color: $color-wechat;
  }

  &__delete {
    margin-left: auto;
    border: 0;
    background: transparent;
    padding: 0;
    font-size: 12px;
    color: $color-wechat;
    cursor: pointer;
  }

  &__panel {
    margin-top: 8px;
    background: $color-like-bg;
    border-radius: 3px;
    overflow: hidden;
  }

  &__likes {
    margin: 0;
    padding: 8px 10px;
    font-size: 13px;
    color: $color-wechat;
    line-height: 1.45;
    display: flex;
    gap: 6px;
    border-bottom: 1px solid rgba($color-line, 0.9);

    &:last-child {
      border-bottom: 0;
    }
  }

  &__heart {
    color: $color-maple;
    flex-shrink: 0;
  }

  &__comments {
    margin: 0;
    padding: 6px 10px 8px;
    list-style: none;
  }

  &__comment {
    font-size: 13px;
    line-height: 1.5;
    color: $color-ink;
    padding: 2px 0;
  }

  &__comment-user {
    color: $color-wechat;
    font-weight: 600;
  }
}
</style>
