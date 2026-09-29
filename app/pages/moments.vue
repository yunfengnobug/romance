<script setup lang="ts">
import { momentsPosts as mockPosts, momentsProfile as mockProfile } from '~~/data/moments'

useHead({
  title: '朋友圈 · 朝心',
})

const {
  me,
  loggedIn,
  loginOpen,
  refreshMe,
  logout,
  openLogin,
  closeLogin,
} = useMomentsAuth()

const profile = ref({
  nickname: '',
  signature: '',
  avatar: '',
  cover: '',
})
const posts = ref<any[]>([])
const loading = ref(true)
const loadError = ref('')
const usingMock = ref(false)
const previewSrc = ref('')
const composerOpen = ref(false)
const sessionError = ref('')

// 打开图片预览
function openPreview(src: string) {
  previewSrc.value = src
}

// 关闭图片预览
function closePreview() {
  previewSrc.value = ''
}

// 开发回退：用仓库里的示例数据
function applyMock() {
  profile.value = { ...mockProfile }
  posts.value = mockPosts.map((item: any) => ({ ...item }))
  usingMock.value = true
}

// 拉公开资料 + 动态流；仅在开发环境且接口不可达时回退 mock
async function loadPublic(silent = false) {
  if (!silent) {
    loading.value = true
    loadError.value = ''
  }
  usingMock.value = false

  if (momentsUseMock()) {
    applyMock()
    loading.value = false
    return
  }

  try {
    const [profileRaw, feedRaw] = await Promise.all([
      fetchMomentsProfile(),
      fetchMomentsFeed(),
    ])
    profile.value = mapProfile(profileRaw, mockProfile)
    posts.value = feedRaw.map((item: any) => mapMomentPost(item, profile.value.avatar))
  }
  catch (err: any) {
    if (import.meta.dev && isUnreachableError(err)) {
      applyMock()
      loadError.value = ''
    }
    else {
      posts.value = []
      loadError.value = readErrorMessage(err)
    }
  }
  finally {
    loading.value = false
  }
}

// 未登录先打开登录，登录后再进发表页
function onTapPublish() {
  if (loggedIn.value) {
    composerOpen.value = true
    return
  }
  openLogin()
}

async function onLoggedIn(user: any) {
  if (user) me.value = user
  closeLogin()
  await refreshMe()
  await loadPublic(true)
  if (loggedIn.value || user) composerOpen.value = true
}

async function onLogout() {
  sessionError.value = ''
  try {
    await logout()
  }
  catch (err: any) {
    sessionError.value = readErrorMessage(err)
  }
}

// 发表成功后插到最前；没有回传正文就重拉列表
function onPublished(created: any) {
  composerOpen.value = false
  if (created && (created.id || created.text || created.images)) {
    const mapped = mapMomentPost(created, me.value?.avatar || profile.value.avatar)
    if (!mapped.author) mapped.author = me.value?.nickname || profile.value.nickname
    if (!mapped.avatar) mapped.avatar = me.value?.avatar || profile.value.avatar
    posts.value = [mapped, ...posts.value.filter((item: any) => item.id !== mapped.id)]
    return
  }
  loadPublic(true)
}

async function onDeletePost(post: any) {
  if (!post?.id) return
  try {
    await deleteMomentPost(String(post.id))
    posts.value = posts.value.filter((item: any) => item.id !== post.id)
  }
  catch (err: any) {
    window.alert(readErrorMessage(err))
  }
}

onMounted(async () => {
  await Promise.all([loadPublic(), refreshMe()])
})
</script>

<template>
  <div class="moments">
    <div class="moments__phone">
      <section class="moments__cover">
        <img v-if="profile.cover" :src="profile.cover" alt="朋友圈封面" class="moments__cover-img" />
        <button
          type="button"
          class="moments__camera"
          :title="loggedIn ? '发朋友圈' : '登录后发朋友圈'"
          @click="onTapPublish"
        >
          <template v-if="loggedIn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M9.2 5.2 8 7H5.8C4.8 7 4 7.8 4 8.8v8.4C4 18.2 4.8 19 5.8 19h12.4c1 0 1.8-.8 1.8-1.8V8.8c0-1-.8-1.8-1.8-1.8H16l-1.2-1.8H9.2zM12 16.2A3.4 3.4 0 1 1 12 9.4a3.4 3.4 0 0 1 0 6.8z"
              />
            </svg>
          </template>
          <span v-else>发朋友圈</span>
        </button>
        <div class="moments__identity">
          <div class="moments__who">
            <p class="moments__nickname">{{ profile.nickname }}</p>
            <p class="moments__sign">{{ profile.signature }}</p>
          </div>
          <img v-if="profile.avatar" :src="profile.avatar" :alt="profile.nickname" class="moments__avatar" />
          <div v-else class="moments__avatar" aria-hidden="true" />
        </div>
      </section>

      <div v-if="loggedIn" class="moments__session">
        <span>已登录 {{ me.nickname || me.username }}</span>
        <button type="button" @click="onLogout">退出</button>
      </div>
      <p v-if="sessionError" class="moments__banner moments__banner--error">{{ sessionError }}</p>
      <p v-if="usingMock" class="moments__banner">
        接口暂不可用，正在显示本地示例。本地可设 <code>NUXT_PUBLIC_ADMIN_API_BASE</code>。
      </p>

      <p v-if="loading" class="moments__empty">正在加载动态…</p>
      <div v-else-if="loadError" class="moments__empty">
        <p>{{ loadError }}</p>
        <button type="button" class="moments__retry" @click="loadPublic">重试</button>
      </div>
      <section v-else-if="posts.length" class="moments__feed">
        <MomentPost
          v-for="post in posts"
          :key="post.id"
          :post="post"
          :can-delete="canDeletePost(post, me)"
          @preview="openPreview"
          @delete="onDeletePost"
        />
      </section>
      <p v-else class="moments__empty">还没有动态。</p>
    </div>

    <ImageLightbox v-if="previewSrc" :src="previewSrc" @close="closePreview" />
    <MomentsLogin v-if="loginOpen" @close="closeLogin" @success="onLoggedIn" />
    <MomentsComposer v-if="composerOpen" @close="composerOpen = false" @published="onPublished" />
  </div>
</template>

<style lang="scss" scoped>
.moments {
  padding: 0 0 24px;

  &__phone {
    max-width: $moments-width;
    margin: 0 auto;
    background: $color-paper;
    min-height: calc(100vh - $header-height - 80px);
    box-shadow: 0 0 0 1px $color-line;
  }

  &__cover {
    position: relative;
    height: 240px;
    background: #c9b8a8;
  }

  &__cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__camera {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 2;
    border: 0;
    background: rgba(20, 16, 14, 0.28);
    color: #fff;
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 13px;
    letter-spacing: 0.06em;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(6px);

    svg {
      width: 22px;
      height: 22px;
      display: block;
    }
  }

  &__identity {
    position: absolute;
    right: 16px;
    bottom: -28px;
    display: flex;
    align-items: flex-end;
    gap: 10px;
  }

  &__who {
    text-align: right;
    padding-bottom: 36px;
    color: #fff;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
  }

  &__nickname {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.12em;
  }

  &__sign {
    margin: 4px 0 0;
    font-size: 12px;
    opacity: 0.92;
  }

  &__avatar {
    width: 72px;
    height: 72px;
    border-radius: 8px;
    object-fit: cover;
    border: 2px solid $color-paper;
    background: $color-like-bg;
  }

  &__session {
    margin: 40px 16px 0;
    padding: 8px 2px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    color: $color-muted;

    button {
      border: 0;
      background: transparent;
      color: $color-wechat;
      cursor: pointer;
      font-size: 12px;
    }
  }

  &__banner {
    margin: 12px 16px 0;
    padding: 8px 10px;
    border-radius: 6px;
    background: $color-like-bg;
    color: $color-muted;
    font-size: 12px;
    line-height: 1.5;

    code {
      font-size: 11px;
    }

    &--error {
      color: $color-maple-deep;
    }
  }

  &__cover + &__banner,
  &__cover + &__empty {
    margin-top: 40px;
  }

  &__feed {
    padding-top: 40px;
  }

  &__session + &__feed,
  &__banner + &__feed,
  &__session + &__banner {
    padding-top: 12px;
  }

  &__empty {
    padding: 64px 24px;
    text-align: center;
    color: $color-muted;
    font-size: 14px;
  }

  &__retry {
    margin-top: 12px;
    border: 0;
    background: $color-maple;
    color: #fff;
    border-radius: 8px;
    padding: 8px 16px;
    cursor: pointer;
  }
}

@media (min-width: 680px) {
  .moments {
    padding: 16px 16px 24px;

    &__cover {
      height: 280px;
    }
  }
}
</style>
