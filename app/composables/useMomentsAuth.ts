// 朋友圈登录态：账号由后台发放，前台只做用户名 + TOTP / 备用码。

export function useMomentsAuth() {
  const me = useState<any>('moments-me', () => null)
  const ready = useState('moments-auth-ready', () => false)
  const loginOpen = useState('moments-login-open', () => false)

  const loggedIn = computed(() => Boolean(me.value?.username || me.value?.id))

  // 仅在浏览器拉会话，cookie 在 admin 域上
  async function refreshMe() {
    try {
      me.value = await fetchMomentsMe()
    }
    catch {
      me.value = null
    }
    finally {
      ready.value = true
    }
  }

  async function logout() {
    try {
      await logoutMoments()
    }
    catch {
      // 退出失败也清掉本地态，避免卡在已登录
    }
    me.value = null
  }

  function openLogin() {
    loginOpen.value = true
  }

  function closeLogin() {
    loginOpen.value = false
  }

  return {
    me,
    ready,
    loggedIn,
    loginOpen,
    refreshMe,
    logout,
    openLogin,
    closeLogin,
  }
}
