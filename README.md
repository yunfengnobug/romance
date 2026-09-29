# 我们的故事

王俊杰与李朝新的婚礼与生活小站（lizhaoxin.com）：安静的首页、仿微信的朋友圈，以及婚纱照相册。

基于 **Nuxt 4**（当前 npm `latest`），不使用 Fireclaw / `@nuxt/content` 等额外模块。朋友圈的公开流与发帖走 admin 接口；婚纱照读 admin 公开相册（动态分类），本站不连库。

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

# 调试用：强制婚纱照走仓库 mock（生产不要开）
# NUXT_PUBLIC_WEDDING_USE_MOCK=1
```

`runtimeConfig.public.adminApiBase` 读取 `NUXT_PUBLIC_ADMIN_API_BASE`。写操作与 `/me` 均使用 `credentials: 'include'`，需后台放行本站 Origin 的 CORS + Cookie。

## 功能

- 首页：我们的故事简介，进入「朋友圈」与「婚纱照」
- 朋友圈：封面与动态流来自 admin 公开接口；1/2/3/4/9 图宫格、点赞与评论展示、点击图片全屏预览。`img.yzre.cn` / 七牛图在宫格、灯箱、封面、头像展示时追加 `imageView2`（webp），公式与婚纱照相同（CSS 宽 × dpr × 1.2，步进 80，最大 2200），不改接口原 URL。
- 发朋友圈：未登录点「发朋友圈」走账号 + 6 位 TOTP / 备用码（无密码）；登录后仿微信发表（文本、最多 9 图或 **1 条短视频**、可选位置）。图片/视频先 `prepare` 再直传七牛；视频与图片不能同时发。
- 自己的动态可删除（后台允许时）
- 婚纱照：主视觉、我们的故事、全部 + 后台动态分类、多列瀑布流、加载 / 空 / 错误状态、图片预览。分类名不在前端写死。`img.yzre.cn` / 七牛图在列表、灯箱、封面展示时追加 `imageView2`（webp）。请求宽 = `ceil(渲染CSS宽 × dpr × 1.2 / 80) × 80`，封顶 2200，不改接口原 URL。
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
| 上传准备 | POST | `/api/moments/posts/prepare` `{ filename, contentType, size, kind? }` |
| 发帖 | POST | `/api/moments/posts` `{ text, images[], location, video?, videoCover?, videoDuration? }` |
| 删帖 | DELETE | `/api/moments/posts/:id` |

朋友圈短视频限制（前后端对齐）：**最长 60 秒、最大 80MB**，MIME 以 `video/mp4`、`video/quicktime`、`video/webm` 为主。封面优先用上传的 `videoCover`，否则对七牛视频做 `vframe` 抽帧。公开列表需带回 `video` / `videoCover`（字段名差异由前端兼容）。

字段名若与后台略有出入，前端会做兼容映射。婚纱照分类与朋友圈无关，也不使用 yunfeng 的 draft/final/base。

## 婚纱照接口

均相对于 `adminApiBase`（公开读，不带 cookie）。romance 不连库。admin 分类 CRUD 与公开接口由**单独仓库**落地；本站按下面合约等待，404 或空列表显示空相册，不回退 Unsplash，也不使用 初修/精修/底图。

| 用途 | 方法 | 路径 |
| --- | --- | --- |
| 分类列表 | GET | `/api/public/wedding/categories` |
| 照片列表 | GET | `/api/public/wedding/photos` |

期望信封（`data` 可以是数组，或带 `categories` / `photos` 的对象）：

```json
{
  "code": 0,
  "data": [
    { "id": 1, "slug": "outdoor", "label": "外景", "sort_order": 1 }
  ]
}
```

```json
{
  "code": 0,
  "data": [
    { "id": 10, "url": "https://…", "category_id": 1, "sort_order": 1 }
  ]
}
```

`label` 用于 tab 文案。照片用 `category_id` 或 `category_slug` 归组。Tab = 「全部」+ 接口分类。路径若在 admin PR 里微调，再对齐客户端即可。

仅当设置了 `NUXT_PUBLIC_WEDDING_USE_MOCK` 时才使用 `data/wedding.ts` 里的示例分类/照片。网络错误显示说明并允许重试。

## 技术栈与模块

需要的：

- Nuxt 4 + Vue 3 + TypeScript
- `sass`：页面使用嵌套 SCSS

不需要、也没有安装的：

- **Fireclaw**：不是 Nuxt 网站模块（偏 OpenClaw / 微虚拟机），与本展示站无关
- **@nuxt/content**（没有叫 Content 7 的官方包；当前是 Content v3）：适合 markdown 文档/博客
- 支付相关模块

婚纱照与朋友圈的七牛图在展示层用 `imageView2` 出 webp，宽度跟屏幕上的盒子走（× dpr × 1.2，步进 80，最大 2200）；其它远程图仍用普通 `<img>`。朋友圈视频走原文件播放，封面可用上传图或七牛 `vframe`。

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
data/           # 朋友圈 / 婚纱照 mock，仅调试开关使用
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
