// 朋友圈对接 admin 的轻量客户端。字段名按常见信封做兼容，不沿用婚纱照的 draft/final。

const QINIU_HOSTS: Record<string, string> = {
  z0: 'https://upload.qiniup.com',
  z1: 'https://upload-z1.qiniup.com',
  z2: 'https://upload-z2.qiniup.com',
  na0: 'https://upload-na0.qiniup.com',
  as0: 'https://upload-as0.qiniup.com',
}

/** 去掉末尾斜杠，避免拼出双斜杠 */
export function adminApiBase(): string {
  const config = useRuntimeConfig()
  return String(config.public.adminApiBase || 'https://admin.yzre.cn').replace(/\/$/, '')
}

/** 是否强制走仓库 mock */
export function momentsUseMock(): boolean {
  const raw = String(useRuntimeConfig().public.momentsUseMock || '').toLowerCase()
  return raw === '1' || raw === 'true' || raw === 'yes'
}

/** 从各种信封里取出业务数据 */
export function unwrapPayload(raw: any): any {
  if (raw == null || typeof raw !== 'object') return raw
  if (Array.isArray(raw)) return raw
  if (isErrorEnvelope(raw)) {
    throw new Error(readMessage(raw) || '请求失败')
  }
  if (raw.data != null && typeof raw.data === 'object') return raw.data
  if (raw.result != null && typeof raw.result === 'object') return raw.result
  return raw
}

/** 取出列表字段，兼容 posts / items / list / feed */
export function pickList(raw: any): any[] {
  const data = unwrapPayload(raw)
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []
  for (const key of ['posts', 'items', 'list', 'feed', 'moments', 'records']) {
    if (Array.isArray(data[key])) return data[key]
  }
  return []
}

/** 把接口里的地址字段收成字符串 */
export function pickUrl(item: any): string {
  if (!item) return ''
  if (typeof item === 'string') return item
  return item.url || item.src || item.link || item.cdnUrl || item.publicUrl || item.path || ''
}

/** 格式化接口时间为朋友圈常见展示 */
export function formatMomentTime(value: any): string {
  if (value == null || value === '') return ''
  if (typeof value === 'number' && value < 1e12) {
    value = value * 1000
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const hhmm = `${pad(date.getHours())}:${pad(date.getMinutes())}`
  const sameDay = date.toDateString() === now.toDateString()
  if (sameDay) {
    const mins = Math.floor((now.getTime() - date.getTime()) / 60000)
    if (mins < 1) return '刚刚'
    if (mins < 60) return `${mins} 分钟前`
    return `今天 ${hhmm}`
  }

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return `昨天 ${hhmm}`

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}月${date.getDate()}日 ${hhmm}`
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

/** 把公开资料映射到封面区 */
export function mapProfile(raw: any, fallback: any) {
  const data = unwrapPayload(raw) || {}
  const profile = data.profile && typeof data.profile === 'object' ? data.profile : data
  return {
    nickname: profile.nickname || profile.name || profile.displayName || fallback.nickname,
    signature: profile.signature || profile.bio || profile.intro || fallback.signature || '',
    avatar: pickUrl(profile.avatar) || fallback.avatar,
    cover: pickUrl(profile.cover || profile.coverUrl || profile.banner) || fallback.cover,
  }
}

/** 把一条动态映射到 MomentPost 使用的结构 */
export function mapMomentPost(raw: any, fallbackAvatar = '') {
  const post = raw && typeof raw === 'object' ? raw : {}
  const author = post.author && typeof post.author === 'object' ? post.author : null
  const user = post.user && typeof post.user === 'object' ? post.user : null
  const images = pickImages(post)
  return {
    id: String(post.id ?? post._id ?? post.postId ?? ''),
    author:
      post.authorName
      || post.nickname
      || author?.nickname
      || author?.name
      || user?.nickname
      || user?.name
      || (typeof post.author === 'string' ? post.author : '')
      || post.username
      || '朝心',
    avatar:
      pickUrl(post.avatar)
      || pickUrl(post.authorAvatar)
      || pickUrl(author?.avatar)
      || pickUrl(user?.avatar)
      || fallbackAvatar,
    text: post.text || post.content || post.body || '',
    images,
    time: formatMomentTime(post.time || post.createdAt || post.created_at || post.publishedAt || post.date),
    location: pickLocation(post.location || post.place),
    likes: pickLikes(post.likes || post.likeUsers),
    comments: pickComments(post.comments),
    username: post.username || post.authorUsername || author?.username || user?.username || '',
    userId: post.userId || post.authorId || author?.id || user?.id || '',
    canDelete: Boolean(post.canDelete || post.mine || post.isOwner || post.owned),
  }
}

/** 判断当前登录者能否删除这条动态 */
export function canDeletePost(post: any, me: any): boolean {
  if (!post || !me) return false
  if (post.canDelete) return true
  const mine = [me.id, me.userId, me.username].filter(Boolean).map(String)
  const theirs = [post.userId, post.username].filter(Boolean).map(String)
  return theirs.some((id: string) => mine.includes(id))
}

/** 取出登录用户 */
export function mapMe(raw: any) {
  const data = unwrapPayload(raw)
  if (!data) return null
  const user = data.user && typeof data.user === 'object' ? data.user : data
  if (data.authenticated === false || user.authenticated === false) return null
  const username = user.username || user.name || user.account
  if (!username && user.id == null) return null
  return {
    id: user.id ?? user.userId ?? '',
    username: username || '',
    nickname: user.nickname || user.displayName || username || '',
    avatar: pickUrl(user.avatar) || '',
  }
}

/** 公开动态流（只读，不带登录 cookie，避免公开接口 CORS 不放行凭证） */
export async function fetchMomentsFeed() {
  const raw = await adminFetch('/api/public/moments/feed')
  return pickList(raw)
}

/** 公开封面资料 */
export async function fetchMomentsProfile() {
  return await adminFetch('/api/public/moments/profile')
}

/** 发起登录挑战（不需要密码） */
export async function requestAuthChallenge(username: string) {
  return unwrapPayload(await adminFetch('/api/moments/auth/challenge', {
    method: 'POST',
    body: { username },
    auth: true,
  }))
}

/** 用 TOTP / 备用码完成登录 */
export async function verifyAuthCode(username: string, code: string) {
  const raw = await adminFetch('/api/moments/auth/verify', {
    method: 'POST',
    body: { username, code },
    auth: true,
  })
  return mapMe(raw)
}

/** 退出登录 */
export async function logoutMoments() {
  await adminFetch('/api/moments/auth/logout', {
    method: 'POST',
    auth: true,
  })
}

/** 读取当前会话，未登录返回 null */
export async function fetchMomentsMe() {
  try {
    const raw = await adminFetch('/api/moments/auth/me', { auth: true })
    return mapMe(raw)
  }
  catch (err: any) {
    const status = err?.statusCode || err?.status
    if (status === 401 || status === 403) return null
    throw err
  }
}

/** 申请一张图的七牛上传凭证，再直传 */
export async function uploadMomentImage(file: File): Promise<string> {
  const prep = unwrapPayload(await adminFetch('/api/moments/posts/prepare', {
    method: 'POST',
    body: {
      filename: file.name,
      contentType: file.type || 'image/jpeg',
      size: file.size,
    },
    auth: true,
  })) || {}

  const token = prep.token || prep.uploadToken || prep.uptoken || prep.upload_token
  const key = prep.key || prep.fileKey || ''
  const uploadUrl = resolveUploadUrl(prep)
  if (!token) throw new Error('后台未返回上传凭证')

  const form = new FormData()
  form.append('token', token)
  if (key) form.append('key', key)
  form.append('file', file)

  const uploaded: any = await $fetch(uploadUrl, {
    method: 'POST',
    body: form,
  })

  const url = pickUrl(prep) || joinUrl(prep.domain || prep.cdnDomain || prep.baseUrl, uploaded?.key || key)
  if (!url) throw new Error('上传成功但未得到图片地址')
  return url
}

/** 发布一条朋友圈，未登录不要调用 */
export async function createMomentPost(payload: { text: string, images: string[], location: string }) {
  const raw = await adminFetch('/api/moments/posts', {
    method: 'POST',
    body: {
      text: payload.text,
      images: payload.images,
      location: payload.location || '',
    },
    auth: true,
  })
  const data = unwrapPayload(raw)
  return data?.post && typeof data.post === 'object' ? data.post : data
}

/** 删除自己的动态 */
export async function deleteMomentPost(id: string) {
  await adminFetch(`/api/moments/posts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
  })
}

/** 网络层不可达（开发环境才允许回退 mock） */
export function isUnreachableError(err: any): boolean {
  const status = err?.statusCode || err?.status
  if (!status) return true
  return status >= 500
}

/** 抽出人类可读的错误文案 */
export function readErrorMessage(err: any): string {
  const fromBody = readMessage(err?.data) || readMessage(err?.response?._data)
  if (fromBody) return fromBody
  if (err?.statusMessage && err.statusMessage !== 'Fetch Error') return err.statusMessage
  const raw = String(err?.message || err?.cause?.message || '')
  if (/Failed to fetch|NetworkError|CORS|ERR_FAILED|no response/i.test(raw)) {
    return '无法连接后台，请检查地址或跨域设置'
  }
  if (raw && !raw.startsWith('[GET]') && !raw.startsWith('[POST]') && !raw.startsWith('[DELETE]')) {
    return raw
  }
  const status = err?.statusCode || err?.status
  if (status === 401) return '登录已失效，请重新登录'
  if (status === 403) return '没有权限'
  if (status === 404) return '接口不存在'
  if (status >= 500) return '后台暂时不可用'
  return '请求失败，请稍后重试'
}

/** 统一请求 admin。写操作 / me 必须带 cookie */
async function adminFetch(path: string, options: any = {}) {
  const url = `${adminApiBase()}${path}`
  const auth = Boolean(options.auth)
  try {
    return await $fetch(url, {
      method: options.method || 'GET',
      body: options.body,
      credentials: auth ? 'include' : 'omit',
      headers: {
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    })
  }
  catch (err: any) {
    const message = readErrorMessage(err)
    const wrapped: any = new Error(message)
    wrapped.statusCode = err?.statusCode || err?.status
    wrapped.data = err?.data
    throw wrapped
  }
}

function isErrorEnvelope(raw: any): boolean {
  if (!raw || typeof raw !== 'object') return false
  if (!('code' in raw)) return false
  const code = raw.code
  return code !== 0 && code !== 200 && code !== '0' && code !== 'ok' && code !== 'OK'
}

function readMessage(raw: any): string {
  if (!raw) return ''
  if (typeof raw === 'string') return raw.trim()
  if (typeof raw !== 'object') return ''
  const value = raw.message || raw.msg || raw.error || raw.detail
  if (typeof value === 'string') return value
  if (value && typeof value.message === 'string') return value.message
  return ''
}

function pickImages(post: any): string[] {
  const raw = post.images || post.photos || post.pics || post.media || []
  if (!Array.isArray(raw)) return []
  return raw.map(pickUrl).filter(Boolean)
}

function pickLocation(value: any): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.name || value.title || value.address || value.text || ''
}

function pickLikes(raw: any): string[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item: any) => {
    if (typeof item === 'string') return item
    return item?.nickname || item?.name || item?.user || item?.username || item?.user?.nickname || ''
  }).filter(Boolean)
}

function pickComments(raw: any): any[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item: any) => ({
    user: item.user || item.author || item.nickname || item.username || item.name || item.userName || '',
    text: item.text || item.content || item.body || item.comment || '',
  })).filter((item: any) => item.user || item.text)
}

function resolveUploadUrl(prep: any): string {
  const direct = prep.uploadUrl || prep.upHost || prep.uploadHost || prep.host
  if (typeof direct === 'string' && /^https?:\/\//.test(direct)) return direct
  const region = String(prep.region || prep.zone || '').toLowerCase()
  if (region && QINIU_HOSTS[region]) return QINIU_HOSTS[region]
  return 'https://upload.qiniup.com'
}

function joinUrl(domain: string, key: string): string {
  if (!domain || !key) return ''
  return `${String(domain).replace(/\/$/, '')}/${String(key).replace(/^\//, '')}`
}
