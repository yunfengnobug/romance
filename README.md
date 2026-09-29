# 云枫

云枫的个人站点：安静的首页、仿微信的朋友圈，以及婚纱照相册骨架。

基于 **Nuxt 4**（当前 npm `latest`），不使用 Fireclaw / `@nuxt/content` 等额外模块。朋友圈的公开流与发帖走 admin 接口；婚纱照仍用仓库内 mock（域名切换另做）。

## 本地运行

```bash
pnpm i
pnpm dev
```

开发服务默认监听 `http://127.0.0.1:43180`。

生产构建：

```bash
pnpm build
```

本地覆盖后台地址时，复制 `.env.example` 为 `.env`：

```bash
# 后台 API 根地址，生产默认 https://admin.yzre.cn
NUXT_PUBLIC_ADMIN_API_BASE=https://admin.yzre.cn

# 调试用：强制朋友圈走仓库 mock（生产不要开）
# NUXT_PUBLIC_MOMENTS_USE_MOCK=1
```

`runtimeConfig.public.adminApiBase` 读取 `NUXT_PUBLIC_ADMIN_API_BASE`。写操作与 `/me` 均使用 `credentials: 'include'`，需后台放行本站 Origin 的 CORS + Cookie。

## 功能

- 首页：云枫简介，进入「朋友圈」与「婚纱照」
- 朋友圈：封面与动态流来自 admin 公开接口；1/2/3/4/9 图宫格、点赞与评论展示、点击图片全屏预览
- 发朋友圈：未登录点「发朋友圈」走账号 + 6 位 TOTP / 备用码（无密码）；登录后仿微信发表（文本、多图、可选位置），图片先 `prepare` 再直传七牛
- 自己的动态可删除（后台允许时）
- 婚纱照：仍为 mock。主视觉、我们的故事、全部 / 外景 / 室内分组、多列瀑布流、空状态、图片预览
- 顶部导航：首页 / 朋友圈 / 婚纱照

朋友圈优先打真实接口。仅当设置了 `NUXT_PUBLIC_MOMENTS_USE_MOCK`，或**开发环境**下接口不可达时，才回退 `data/moments.ts`。生产失败会显示错误，而不是默默用 mock。

账号在 admin 里发放，本站只做消费端，不允许匿名发帖。

## 朋友圈接口

均相对于 `adminApiBase`：

| 用途 | 方法 | 路径 |
| --- | --- | --- |
| 公开动态 | GET | `/api/public/moments/feed` |
| 公开资料 | GET | `/api/public/moments/profile` |
| 登录挑战 | POST | `/api/moments/auth/challenge` `{ username }` |
| 校验动态码 | POST | `/api/moments/auth/verify` `{ username, code }` |
| 退出 | POST | `/api/moments/auth/logout` |
| 当前用户 | GET | `/api/moments/auth/me` |
| 上传准备 | POST | `/api/moments/posts/prepare` |
| 发帖 | POST | `/api/moments/posts` `{ text, images[], location }` |
| 删帖 | DELETE | `/api/moments/posts/:id` |

字段名若与后台略有出入，前端会做兼容映射。婚纱照的 draft/final 与朋友圈无关。

## 技术栈与模块

需要的：

- Nuxt 4 + Vue 3 + TypeScript
- `sass`：页面使用嵌套 SCSS

不需要、也没有安装的：

- **Fireclaw**：不是 Nuxt 网站模块（偏 OpenClaw / 微虚拟机），与本展示站无关
- **@nuxt/content**（没有叫 Content 7 的官方包；当前是 Content v3）：适合 markdown 文档/博客
- 支付相关模块

以后如果要优化远程图片，可以再考虑 `@nuxt/image`，现在用普通 `<img>` 即可。

## 目录

```
app/            # Nuxt 4 前端源码
  pages/
  components/
  composables/
  utils/
  layouts/
  assets/styles/
  app.vue
data/           # 婚纱照 mock；朋友圈 mock 仅作回退
public/
nuxt.config.ts
.env.example
```

## 编码约定

- 页面与组件使用 `<script setup lang="ts">` + `<template>` + `<style lang="scss" scoped>`
- SCSS 采用嵌套写法（BEM 友好），不写扁平并列选择器
- 函数与非平凡变量上方附简短中文注释
- TypeScript 保持轻量：基础类型即可，复杂对象用 `any` 或不写显式类型
- 逻辑尽量写在页面/组件内，避免过深抽象
