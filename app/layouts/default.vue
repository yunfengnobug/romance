<script setup lang="ts">
</script>

<template>
  <div class="layout">
    <SiteHeader />
    <main class="layout__main">
      <slot />
    </main>
    <footer class="layout__footer">
      <span>云枫</span>
      <span class="layout__dot">·</span>
      <span>仅作展示，图片为占位</span>
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

  &__dot {
    margin: 0 6px;
    color: $color-maple;
  }
}
</style>
