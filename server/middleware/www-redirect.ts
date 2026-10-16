// EdgeOne Pages 的 edgeone.json 会在边缘把自定义域名的 www 301 到 apex。
// 这里再按 Host 兜底一次，只处理 www.lizhaoxin.com，避免影响其它域名或预览主机。
const WWW_HOST = 'www.lizhaoxin.com'
const APEX_ORIGIN = 'https://lizhaoxin.com'

export default defineEventHandler((event) => {
  const hostHeader = getRequestHeader(event, 'host') || ''
  const host = hostHeader.split(':')[0].toLowerCase()
  if (host !== WWW_HOST) {
    return
  }

  const url = getRequestURL(event)
  return sendRedirect(event, `${APEX_ORIGIN}${url.pathname}${url.search}`, 301)
})
