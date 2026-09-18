<script setup lang="ts">
useHead({
  title: '云枫',
})
</script>

<template>
  <div class="home">
    <section class="home__hero">
      <p class="home__eyebrow">个人站点</p>
      <h1 class="home__title">云枫</h1>
      <p class="home__lead">
        风停在云上，日子落在人间。这里没有喧闹，只有几帧生活，和一本还在装订的婚纱相册。
      </p>
    </section>

    <section class="home__entries">
      <NuxtLink to="/moments" class="home__card">
        <img
          class="home__card-img"
          src="https://images.unsplash.com/photo-1508193638397-1c4234db14d8?auto=format&fit=crop&w=900&q=80"
          alt="朋友圈入口"
        />
        <div class="home__card-body">
          <h2>朋友圈</h2>
          <p>看看最近的生活切片。展示用动态，稍后会接上真实接口。</p>
          <span class="home__card-go">进入 →</span>
        </div>
      </NuxtLink>

      <NuxtLink to="/wedding" class="home__card">
        <img
          class="home__card-img"
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80"
          alt="婚纱照入口"
        />
        <div class="home__card-body">
          <h2>婚纱照</h2>
          <p>相册骨架已经搭好。占位图可随时换成你们的照片。</p>
          <span class="home__card-go">进入 →</span>
        </div>
      </NuxtLink>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home {
  max-width: $site-width;
  margin: 0 auto;
  padding: 28px 16px 48px;

  &__hero {
    text-align: center;
    padding: 36px 8px 40px;
  }

  &__eyebrow {
    margin: 0 0 12px;
    font-size: 12px;
    letter-spacing: 0.28em;
    color: $color-maple;
    text-transform: uppercase;
  }

  &__title {
    margin: 0 0 16px;
    font-size: 48px;
    font-weight: 600;
    letter-spacing: 0.28em;
    line-height: 1.1;
    color: $color-ink;

    &::after {
      content: '';
      display: block;
      width: 36px;
      height: 2px;
      margin: 16px auto 0;
      background: $color-maple;
      border-radius: 2px;
    }
  }

  &__lead {
    margin: 0 auto;
    max-width: 28em;
    font-size: 16px;
    line-height: 1.8;
    color: $color-muted;
  }

  &__entries {
    display: grid;
    gap: 16px;
  }

  &__card {
    display: block;
    overflow: hidden;
    background: $color-paper;
    border: 1px solid $color-line;
    border-radius: 16px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(58, 50, 44, 0.08);
    }
  }

  &__card-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
  }

  &__card-body {
    padding: 18px 18px 20px;

    h2 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.12em;
    }

    p {
      margin: 0 0 12px;
      font-size: 14px;
      line-height: 1.7;
      color: $color-muted;
    }
  }

  &__card-go {
    font-size: 13px;
    color: $color-maple-deep;
    letter-spacing: 0.08em;
  }
}

@media (min-width: 640px) {
  .home {
    padding-top: 48px;

    &__title {
      font-size: 56px;
    }

    &__entries {
      grid-template-columns: 1fr 1fr;
    }

    &__card-img {
      height: 200px;
    }
  }
}
</style>
