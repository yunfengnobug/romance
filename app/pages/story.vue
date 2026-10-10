<!-- 「我们的故事」纪念页（由 yunfeng /love/story 迁入）；随机爱心由客户端组件承载 -->
<script setup lang="ts">
import { storyDaysTogether } from '~~/data/story'

definePageMeta({
  layout: 'story',
})

useSeoMeta({
  title: '日子 · 我们的故事',
  description: '王俊杰与李朝新的纪念页',
})

useHead({
  bodyAttrs: {
    // 盖住全站枫红光晕，日子页保持原站粉红底
    class: 'is-story',
  },
})

const daysCount = ref(storyDaysTogether())

onMounted(() => {
  // 客户端再校准一次，避免跨请求边界的极小偏差
  daysCount.value = storyDaysTogether()
})
</script>

<template>
  <div class="love-container">
    <StoryHearts />
    <StoryBody :days-count="daysCount" />
  </div>
</template>

<style scoped lang="scss">
.love-container {
  position: relative;
  min-height: 100vh;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe4ec 50%, #ffd6e7 100%);
  overflow: hidden;
  // 对齐 yunfeng base.scss 在故事页上的排版，避免全站枫红字体干扰
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: #333;
  line-height: 1.5;

  :deep(h1),
  :deep(h3),
  :deep(h4),
  :deep(p) {
    padding: 0;
    margin: 0;
  }
}
</style>
