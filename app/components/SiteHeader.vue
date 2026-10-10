<script setup lang="ts">
const route = useRoute()

// 顶部导航项
const navItems = [
  { path: '/', label: '首页' },
  { path: '/moments', label: '朋友圈' },
  { path: '/wedding', label: '婚纱照' },
]

// 判断当前导航是否高亮
function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner">
      <NuxtLink to="/" class="site-header__brand">
        <svg class="site-header__leaf" viewBox="0 0 32 32" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16 4.5c.4 2.6 1.2 5.2 2.2 7.4 2.3-.8 4.8-1.6 7.3-1.4-1.6 2.1-3.4 3.6-5.3 4.7 1.6 1.5 3.6 2.8 5.8 3.6-2.6.6-5.2.4-7.4-.2.2 2.5.6 5.2.9 7.9-1.2-1.8-2.3-3.7-3.5-5.4-1.2 1.7-2.3 3.6-3.5 5.4.3-2.7.7-5.4.9-7.9-2.2.6-4.8.8-7.4.2 2.2-.8 4.2-2.1 5.8-3.6-1.9-1.1-3.7-2.6-5.3-4.7 2.5-.2 5 .6 7.3 1.4 1-2.2 1.8-4.8 2.2-7.4z"
          />
        </svg>
        <span>我们的故事</span>
      </NuxtLink>
      <nav class="site-header__nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="site-header__link"
          :class="{ 'is-active': isActive(item.path) }"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 40;
  height: $header-height;
  background: rgba($color-paper, 0.94);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba($color-maple, 0.12);
  box-shadow: 0 8px 24px rgba($color-maple, 0.05);

  &__inner {
    max-width: 960px;
    height: 100%;
    margin: 0 auto;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: $color-ink;
    white-space: nowrap;
  }

  &__leaf {
    width: 20px;
    height: 20px;
    color: $color-maple;
    flex-shrink: 0;
  }

  &__nav {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__link {
    padding: 6px 10px;
    font-size: 14px;
    color: $color-muted;
    border-radius: 999px;
    transition: color 0.2s ease, background 0.2s ease;

    &:hover {
      color: $color-ink;
      background: rgba($color-maple, 0.06);
    }

    &.is-active {
      color: $color-maple-deep;
      background: rgba($color-maple, 0.12);
      font-weight: 600;
    }
  }
}

@media (max-width: 480px) {
  .site-header {
    &__brand {
      letter-spacing: 0.04em;
      font-size: 14px;
    }

    &__link {
      padding: 6px 8px;
      font-size: 13px;
    }
  }
}
</style>
