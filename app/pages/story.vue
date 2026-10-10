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
  bodyAttrs: {
    // 盖住全站枫红光晕，日子页保持原站粉红底
    class: 'is-story',
  },
})

const daysCount = ref(storyDaysTogether())
const titleChars = STORY_TITLE.split('')

onMounted(() => {
  // 客户端再校准一次，避免跨请求边界的极小偏差
  daysCount.value = storyDaysTogether()
})
</script>

<template>
  <div class="story">
    <StoryHearts />

    <header class="story__header">
      <h1 class="story__title">
        <span
          v-for="(char, i) in titleChars"
          :key="`${char}-${i}`"
          class="story__letter"
          :style="{ animationDelay: `${i * 0.1}s` }"
        >
          {{ char }}
        </span>
      </h1>
      <p class="story__subtitle">{{ STORY_SUBTITLE }}</p>
      <p class="story__counter">
        <span>爱你的第</span>
        <strong>{{ daysCount }}</strong>
        <span>天</span>
      </p>
    </header>

    <section class="story__expressions">
      <article
        v-for="(card, index) in STORY_CARDS"
        :key="card.title"
        class="story__card"
        :style="{ animationDelay: `${index * 0.2}s` }"
      >
        <span class="story__icon">{{ card.icon }}</span>
        <h3>{{ card.title }}</h3>
        <p>{{ card.text }}</p>
      </article>
    </section>

    <section class="story__timeline">
      <h2 class="story__heading">我们的故事</h2>
      <article
        v-for="(item, index) in STORY_TIMELINE"
        :key="item.date"
        class="story__milestone"
        :style="{ animationDelay: `${index * 0.3}s` }"
      >
        <span class="story__marker">{{ item.icon }}</span>
        <div class="story__milestone-body">
          <h3>{{ item.title }}</h3>
          <time>{{ item.date }}</time>
          <p>{{ item.text }}</p>
        </div>
      </article>
    </section>

    <section class="story__messages">
      <h2 class="story__heading">我想对你说</h2>
      <div class="story__message-grid">
        <article
          v-for="(msg, index) in STORY_MESSAGES"
          :key="msg.text"
          class="story__message"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <span class="story__icon story__icon--sm">{{ msg.icon }}</span>
          <p>{{ msg.text }}</p>
        </article>
      </div>
    </section>

    <section class="story__plans">
      <h2 class="story__heading">我们的未来</h2>
      <div class="story__plan-grid">
        <article
          v-for="(plan, index) in STORY_PLANS"
          :key="plan.title"
          class="story__plan"
          :style="{ animationDelay: `${index * 0.2}s` }"
        >
          <span class="story__icon">{{ plan.icon }}</span>
          <h3>{{ plan.title }}</h3>
          <p>{{ plan.text }}</p>
        </article>
      </div>
    </section>

    <section class="story__letter">
      <h2>给朝新的情书</h2>
      <p
        v-for="(line, index) in STORY_LETTER_LINES"
        :key="line"
        :style="{ animationDelay: `${index * 0.3}s` }"
      >
        {{ line }}
      </p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
// 视觉对齐 yzre.cn/love/story（云枫粉红纪念页），不走全站纸色枫红
.story {
  position: relative;
  min-height: calc(100vh - $header-height);
  padding-bottom: 2.5rem;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe4ec 50%, #ffd6e7 100%);
  overflow: hidden;
  font-family: 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  line-height: 1.5;

  h1,
  h2,
  h3,
  p {
    margin: 0;
    padding: 0;
  }

  &__header {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 3.75rem 1.25rem 2.5rem;
  }

  &__title {
    font-size: 3rem;
    font-weight: 700;
    color: #e91e63;
    margin-bottom: 1.25rem;
    text-shadow: 2px 2px 4px rgba(233, 30, 99, 0.3);
  }

  &__letter {
    display: inline-block;
    animation: love-story-bounce 0.6s ease infinite;
  }

  &__subtitle {
    font-size: 1.2rem;
    color: #f06292;
    margin-bottom: 1.25rem;
  }

  &__counter {
    color: #e91e63;
    font-size: 1.2rem;

    strong {
      font-size: 3rem;
      font-weight: 700;
      font-family: Georgia, 'Times New Roman', serif;
      margin: 0 0.3rem;
      background: linear-gradient(135deg, #e91e63, #f06292);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  &__heading {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    color: #e91e63;
    margin-bottom: 2.5rem;

    &::after {
      content: '💕';
      display: block;
      margin-top: 0.625rem;
    }
  }

  &__icon {
    display: block;
    font-size: 3rem;
    margin-bottom: 0.9375rem;
    line-height: 1;

    &--sm {
      font-size: 2rem;
      margin-bottom: 0.625rem;
    }
  }

  &__expressions {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
    padding: 2.5rem 1.25rem;
  }

  &__card {
    background: white;
    border-radius: 1.25rem;
    padding: 1.875rem;
    text-align: center;
    box-shadow: 0 10px 30px rgba(233, 30, 99, 0.15);
    transition:
      transform 0.3s,
      box-shadow 0.3s;
    animation: love-story-fade-in-up 0.6s ease forwards;
    opacity: 0;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(233, 30, 99, 0.25);
    }

    h3 {
      color: #e91e63;
      margin-bottom: 0.625rem;
      font-size: 1.3rem;
      font-weight: 600;
    }

    p {
      color: #666;
      line-height: 1.6;
    }
  }

  &__timeline {
    position: relative;
    z-index: 2;
    padding: 3.75rem 1.25rem;
  }

  &__milestone {
    position: relative;
    display: flex;
    gap: 1.25rem;
    margin-bottom: 1.875rem;
    animation: love-story-fade-in-up 0.6s ease forwards;
    opacity: 0;
  }

  &__marker {
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    background: white;
    border: 3px solid #e91e63;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  &__milestone-body {
    flex: 1;
    background: white;
    padding: 1.5rem;
    border-radius: 0.9375rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);

    h3 {
      color: #e91e63;
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
      font-weight: 600;
    }

    time {
      display: block;
      color: #999;
      font-size: 0.9rem;
      margin-bottom: 0.625rem;
    }

    p {
      color: #555;
      line-height: 1.8;
    }
  }

  &__messages {
    position: relative;
    z-index: 2;
    padding: 3.75rem 1.25rem;
  }

  &__message-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.25rem;
  }

  &__message {
    background: white;
    border-radius: 0.9375rem;
    padding: 1.25rem;
    text-align: center;
    box-shadow: 0 5px 20px rgba(233, 30, 99, 0.1);
    transition: transform 0.3s;
    animation: love-story-fade-in-up 0.6s ease forwards;
    opacity: 0;

    &:hover {
      transform: scale(1.05);
    }

    p {
      color: #555;
      line-height: 1.5;
    }
  }

  &__plans {
    position: relative;
    z-index: 2;
    padding: 3.75rem 1.25rem;
  }

  &__plan-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  &__plan {
    background: linear-gradient(135deg, #fff 0%, #fff5f8 100%);
    border-radius: 1.25rem;
    padding: 1.875rem;
    text-align: center;
    box-shadow: 0 10px 30px rgba(233, 30, 99, 0.1);
    border: 2px solid #fce4ec;
    transition:
      transform 0.3s,
      box-shadow 0.3s;
    animation: love-story-fade-in-up 0.6s ease forwards;
    opacity: 0;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(233, 30, 99, 0.2);
      border-color: #f48fb1;
    }

    h3 {
      color: #e91e63;
      margin-bottom: 0.625rem;
      font-size: 1.2rem;
      font-weight: 600;
    }

    p {
      color: #666;
      line-height: 1.6;
    }
  }

  &__letter {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 3.75rem auto;
    background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
    padding: 2.5rem;
    border-radius: 1.25rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    transform: rotate(-1deg);

    h2 {
      text-align: center;
      color: #e91e63;
      margin-bottom: 1.875rem;
      font-size: 1.8rem;
      font-weight: 700;

      &::before {
        content: '💌 ';
      }

      &::after {
        content: ' 💌';
      }
    }

    p {
      color: #555;
      line-height: 2;
      margin-bottom: 0.9375rem;
      font-size: 1.1rem;
      animation: love-story-fade-in-up 0.6s ease forwards;
      opacity: 0;

      &:last-child {
        font-weight: bold;
        color: #e91e63;
        text-align: center;
        font-size: 1.2rem;
        margin-bottom: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .story {
    &__header {
      padding-top: 2.5rem;
    }

    &__title {
      font-size: 2rem;
    }

    &__counter strong {
      font-size: 2.25rem;
    }

    &__heading {
      font-size: 1.5rem;
    }

    &__expressions,
    &__plan-grid {
      grid-template-columns: 1fr;
    }

    &__letter {
      padding: 1.5rem;
      margin: 2.5rem 0.9375rem;
      transform: none;
    }
  }
}

@keyframes love-story-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes love-story-fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
