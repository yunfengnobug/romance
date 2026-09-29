// 云枫站点配置：Nuxt 4，不额外装 Content / Fireclaw 等模块
export default defineNuxtConfig({
  compatibilityDate: '2026-09-18',
  devtools: { enabled: false },
  css: ['~/assets/styles/main.scss'],
  runtimeConfig: {
    public: {
      // 后台 API 根地址，本地可用 NUXT_PUBLIC_ADMIN_API_BASE 覆盖
      adminApiBase: 'https://admin.yzre.cn',
      // 设为 1/true 时朋友圈强制走仓库 mock（调试用）
      momentsUseMock: '',
    },
  },
  app: {
    head: {
      title: '云枫',
      htmlAttrs: {
        lang: 'zh-CN',
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        {
          name: 'description',
          content: '云枫的个人站点：朋友圈与婚纱照。',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData(content: string, filename: string) {
            // 变量文件自身不再注入，避免循环引用
            if (filename.includes('variables.scss')) return content
            return `@use "~/assets/styles/variables.scss" as *;\n${content}`
          },
        },
      },
    },
  },
})
