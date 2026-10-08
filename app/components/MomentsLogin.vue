<script setup lang="ts">
const emit = defineEmits(['success', 'close'])

const username = ref('')
const code = ref('')
const error = ref('')
const pending = ref(false)
const accountInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  nextTick(() => accountInput.value?.focus())
})

// 账号 + 动态码一次提交；/me 确认前不发出 success，避免半登录
async function submit() {
  const name = username.value.trim()
  const value = code.value.trim()
  if (!name) {
    error.value = '请输入账号'
    return
  }
  if (!value) {
    error.value = '请输入动态码或备用码'
    return
  }
  error.value = ''
  pending.value = true
  try {
    const user = await loginMoments(name, value)
    emit('success', user)
  }
  catch (err: any) {
    error.value = readErrorMessage(err)
  }
  finally {
    pending.value = false
  }
}

function close() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div class="moments-login" role="dialog" aria-modal="true" aria-labelledby="moments-login-title">
      <button type="button" class="moments-login__mask" aria-label="关闭登录" @click="close" />
      <div class="moments-login__card">
        <header class="moments-login__head">
          <h2 id="moments-login-title">登录发朋友圈</h2>
          <button type="button" class="moments-login__x" aria-label="关闭" @click="close">×</button>
        </header>
        <p class="moments-login__lead">账号由后台发放，无需密码。账号和动态码一次提交。</p>

        <form class="moments-login__form" @submit.prevent="submit">
          <label class="moments-login__label" for="moments-username">账号</label>
          <input
            id="moments-username"
            ref="accountInput"
            v-model="username"
            class="moments-login__input"
            type="text"
            name="username"
            autocomplete="username"
            placeholder="请输入账号"
            :disabled="pending"
          />
          <label class="moments-login__label" for="moments-code">动态码 / 备用码</label>
          <input
            id="moments-code"
            v-model="code"
            class="moments-login__input moments-login__input--code"
            type="text"
            name="one-time-code"
            inputmode="text"
            autocomplete="one-time-code"
            placeholder="6 位动态码或备用码"
            :disabled="pending"
          />
          <p v-if="error" class="moments-login__error">{{ error }}</p>
          <button type="submit" class="moments-login__btn" :disabled="pending">
            {{ pending ? '正在登录…' : '登录' }}
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.moments-login {
  position: fixed;
  inset: 0;
  z-index: 94;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;

  &__mask {
    position: absolute;
    inset: 0;
    border: 0;
    background: rgba(32, 24, 20, 0.45);
    cursor: pointer;
  }

  &__card {
    position: relative;
    width: 100%;
    max-width: 360px;
    background: $color-paper;
    border-radius: 16px;
    padding: 22px 20px 20px;
    box-shadow: 0 18px 40px rgba(40, 28, 22, 0.18);
  }

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      letter-spacing: 0.08em;
    }
  }

  &__x {
    border: 0;
    background: transparent;
    color: $color-muted;
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
    padding: 0 2px;
  }

  &__lead {
    margin: 10px 0 0;
    font-size: 13px;
    line-height: 1.6;
    color: $color-muted;
  }

  &__form {
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__label {
    font-size: 13px;
    color: $color-ink;
  }

  &__input {
    width: 100%;
    height: 42px;
    padding: 0 12px;
    border: 1px solid $color-line;
    border-radius: 8px;
    background: #fff;
    color: $color-ink;
    font-size: 15px;

    &:focus {
      outline: 2px solid rgba($color-maple, 0.35);
      border-color: $color-maple;
    }

    &--code {
      letter-spacing: 0.12em;
    }
  }

  &__error {
    margin: 0;
    font-size: 13px;
    color: $color-maple-deep;
  }

  &__btn {
    height: 40px;
    border: 0;
    border-radius: 8px;
    font-size: 15px;
    cursor: pointer;
    background: $color-maple;
    color: #fff;

    &:disabled {
      opacity: 0.65;
      cursor: wait;
    }
  }
}
</style>
