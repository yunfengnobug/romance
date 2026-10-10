<script setup lang="ts">
useHead({
  title: '我们的故事',
})
</script>

<template>
  <div class="home">
    <section class="home__hero">
      <p class="home__eyebrow">王俊杰 · 李朝新</p>
      <h1 class="home__title">我们的故事</h1>
      <p class="home__lead">
        这是王俊杰与李朝新的小站。朋友圈记下日常，婚纱照留下并肩的光。
      </p>
      <NuxtLink to="/story" class="home__whisper">
        <span>在一起</span>
        <span class="home__whisper-dot">·</span>
        <span>订婚</span>
        <span class="home__whisper-dot">·</span>
        <span>结婚</span>
      </NuxtLink>
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
          <p>日常里的片刻，都记在这里。登录后可以发朋友圈。</p>
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
          <p>婚礼那天的光，都收在这里。</p>
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
    padding: 40px 20px 44px;
    margin-bottom: 8px;
    background:
      radial-gradient(ellipse 80% 70% at 50% 0%, rgba($color-maple, 0.1), transparent 68%),
      $color-paper;
    border: 1px solid rgba($color-maple, 0.1);
    border-radius: 22px;
    box-shadow: 0 10px 28px rgba($color-maple, 0.06);
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
    font-size: 36px;
    font-weight: 600;
    letter-spacing: 0.16em;
    line-height: 1.1;
    color: $color-ink;

    &::after {
      content: '';
      display: block;
      width: 42px;
      height: 3px;
      margin: 16px auto 0;
      background: linear-gradient(90deg, transparent, $color-maple, transparent);
      border-radius: 2px;
    }
  }

  &__lead {
    margin: 0 auto;
    max-width: 28em;
    font-size: 16px;
    line-height: 1.85;
    color: $color-muted;
  }

  &__whisper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    margin-top: 20px;
    padding: 6px 14px;
    font-size: 12px;
    letter-spacing: 0.16em;
    color: $color-maple;
    background: rgba($color-maple, 0.07);
    border-radius: 999px;
    transition: color 0.2s ease, background 0.2s ease;

    &:hover {
      color: $color-maple-deep;
      background: rgba($color-maple, 0.12);
    }
  }

  &__whisper-dot {
    margin: 0 6px;
    color: rgba($color-maple, 0.45);
  }

  &__entries {
    display: grid;
    gap: 16px;
  }

  &__card {
    display: block;
    overflow: hidden;
    background: $color-paper;
    border: 1px solid rgba($color-maple, 0.1);
    border-radius: 18px;
    box-shadow: 0 8px 22px rgba($color-maple, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 32px rgba($color-maple, 0.1);
    }
  }

  &__card-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    filter: saturate(0.98);
  }

  &__card-body {
    padding: 20px 20px 22px;

    h2 {
      margin: 0 0 8px;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: 0.12em;
    }

    p {
      margin: 0 0 12px;
      font-size: 14px;
      line-height: 1.75;
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
      font-size: 48px;
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
