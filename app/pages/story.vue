<script setup lang="ts">
import {
  STORY_CARDS,
  STORY_LETTER_LINES,
  STORY_MESSAGES,
  STORY_PLANS,
  STORY_SUBTITLE,
  STORY_TIMELINE,
  STORY_TITLE,
  storyDaysTogether,
} from '~~/data/story'

useHead({
  title: '日子 · 我们的故事',
})

const daysCount = ref(storyDaysTogether())

onMounted(() => {
  // 客户端再校准一次，避免跨请求边界的极小偏差
  daysCount.value = storyDaysTogether()
})
</script>

<template>
  <div class="story">
    <section class="story__hero">
      <p class="story__eyebrow">王俊杰 · 李朝新</p>
      <h1 class="story__title">{{ STORY_TITLE }}</h1>
      <p class="story__lead">{{ STORY_SUBTITLE }}</p>
      <p class="story__days">
        爱你的第
        <strong>{{ daysCount }}</strong>
        天
      </p>
    </section>

    <section class="story__section">
      <ul class="story__cards">
        <li v-for="card in STORY_CARDS" :key="card.title" class="story__card">
          <span class="story__icon" aria-hidden="true">{{ card.icon }}</span>
          <h3>{{ card.title }}</h3>
          <p>{{ card.text }}</p>
        </li>
      </ul>
    </section>

    <section class="story__section">
      <h2 class="story__heading">我们的故事</h2>
      <ol class="story__timeline">
        <li v-for="item in STORY_TIMELINE" :key="item.date" class="story__milestone">
          <span class="story__marker" aria-hidden="true">{{ item.icon }}</span>
          <div class="story__milestone-body">
            <h3>{{ item.title }}</h3>
            <time>{{ item.date }}</time>
            <p>{{ item.text }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="story__section">
      <h2 class="story__heading">我想对你说</h2>
      <ul class="story__messages">
        <li v-for="msg in STORY_MESSAGES" :key="msg.text" class="story__message">
          <span aria-hidden="true">{{ msg.icon }}</span>
          <p>{{ msg.text }}</p>
        </li>
      </ul>
    </section>

    <section class="story__section">
      <h2 class="story__heading">我们的未来</h2>
      <ul class="story__cards">
        <li v-for="plan in STORY_PLANS" :key="plan.title" class="story__card">
          <span class="story__icon" aria-hidden="true">{{ plan.icon }}</span>
          <h3>{{ plan.title }}</h3>
          <p>{{ plan.text }}</p>
        </li>
      </ul>
    </section>

    <section class="story__letter">
      <h2>给朝新的情书</h2>
      <p v-for="line in STORY_LETTER_LINES" :key="line">{{ line }}</p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.story {
  max-width: $site-width;
  margin: 0 auto;
  padding: 28px 16px 56px;

  &__hero {
    text-align: center;
    padding: 36px 8px 12px;
  }

  &__eyebrow {
    margin: 0 0 12px;
    font-size: 12px;
    letter-spacing: 0.28em;
    color: $color-maple;
  }

  &__title {
    margin: 0 0 16px;
    font-size: 32px;
    font-weight: 600;
    letter-spacing: 0.12em;
    line-height: 1.25;
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
    margin: 0 0 18px;
    font-size: 16px;
    line-height: 1.8;
    color: $color-muted;
  }

  &__days {
    margin: 0;
    font-size: 14px;
    letter-spacing: 0.08em;
    color: $color-muted;

    strong {
      display: inline-block;
      margin: 0 4px;
      font-size: 36px;
      font-weight: 600;
      letter-spacing: 0;
      line-height: 1;
      color: $color-maple-deep;
      vertical-align: -4px;
    }
  }

  &__section {
    padding: 28px 0 4px;
  }

  &__heading {
    margin: 0 0 20px;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.2em;

    &::after {
      content: '';
      display: block;
      width: 24px;
      height: 2px;
      margin: 10px auto 0;
      background: $color-maple;
      border-radius: 2px;
    }
  }

  &__cards,
  &__messages,
  &__timeline {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__cards {
    display: grid;
    gap: 12px;
  }

  &__card,
  &__message,
  &__milestone-body {
    background: $color-paper;
    border: 1px solid $color-line;
    border-radius: 16px;
  }

  &__card {
    padding: 20px 18px 22px;
    text-align: center;

    h3 {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.08em;
    }

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.75;
      color: $color-muted;
    }
  }

  &__icon {
    display: block;
    margin-bottom: 10px;
    font-size: 22px;
    line-height: 1;
  }

  &__timeline {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__milestone {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  &__marker {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-paper;
    border: 1px solid rgba($color-maple, 0.28);
    border-radius: 50%;
    font-size: 18px;
  }

  &__milestone-body {
    flex: 1;
    padding: 16px 18px 18px;

    h3 {
      margin: 0 0 6px;
      font-size: 16px;
      font-weight: 600;
      letter-spacing: 0.1em;
    }

    time {
      display: block;
      margin-bottom: 8px;
      font-size: 12px;
      letter-spacing: 0.08em;
      color: $color-maple;
    }

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.8;
      color: $color-muted;
    }
  }

  &__messages {
    display: grid;
    gap: 10px;
  }

  &__message {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;

    p {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: $color-ink;
    }
  }

  &__letter {
    margin-top: 32px;
    padding: 28px 22px 32px;
    background: $color-paper;
    border: 1px solid $color-line;
    border-radius: 16px;

    h2 {
      margin: 0 0 18px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.16em;
    }

    p {
      margin: 0 0 12px;
      font-size: 15px;
      line-height: 2;
      color: $color-ink;

      &:last-child {
        margin-bottom: 0;
        text-align: center;
        color: $color-maple-deep;
        font-weight: 600;
      }
    }
  }
}

@media (min-width: 640px) {
  .story {
    padding-top: 48px;

    &__title {
      font-size: 40px;
    }

    &__cards {
      grid-template-columns: 1fr 1fr;
    }

    &__messages {
      grid-template-columns: 1fr 1fr;
    }
  }
}
</style>
