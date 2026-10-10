<script setup lang="ts">
</script>

<template>
  <div class="story-layout">
    <SiteHeader />
    <main class="story-layout__main">
      <slot />
    </main>
    <footer class="story-layout__footer">
      <p class="story-layout__copy">
        <span>我们的故事</span>
        <span class="story-layout__dot">·</span>
        <span>王俊杰与李朝新</span>
      </p>
      <p class="story-layout__beian">
        <a
          class="story-layout__beian-link"
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
        >
          豫ICP备2023005087号-3
        </a>
      </p>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.story-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe4ec 50%, #ffd6e7 100%);

  &__main {
    flex: 1;
    padding-top: $header-height;
  }

  &__footer {
    padding: 28px 20px 36px;
    text-align: center;
    color: #e91e63;
    font-size: 12px;
    letter-spacing: 0.08em;
    opacity: 0.72;
  }

  &__copy,
  &__beian {
    margin: 0;
  }

  &__beian {
    margin-top: 8px;
    letter-spacing: 0.04em;
  }

  &__beian-link {
    color: inherit;
    text-decoration: none;

    &:hover {
      opacity: 1;
      text-decoration: underline;
    }
  }

  &__dot {
    margin: 0 6px;
  }
}
</style>
