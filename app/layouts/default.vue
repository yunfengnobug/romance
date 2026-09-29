<script setup lang="ts">
</script>

<template>
  <div class="layout">
    <SiteHeader />
    <main class="layout__main">
      <slot />
    </main>
    <footer class="layout__footer">
      <p class="layout__copy">
        <span>我们的故事</span>
        <span class="layout__dot">·</span>
        <span>王俊杰与李朝新</span>
      </p>
      <p class="layout__beian">
        <a
          class="layout__beian-link"
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
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  &__main {
    flex: 1;
    padding-top: $header-height;
  }

  &__footer {
    padding: 28px 20px 36px;
    text-align: center;
    color: $color-muted;
    font-size: 12px;
    letter-spacing: 0.08em;
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
      color: $color-maple;
    }
  }

  &__dot {
    margin: 0 6px;
    color: $color-maple;
  }
}
</style>
