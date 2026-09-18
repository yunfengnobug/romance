# 云枫

云枫的个人站点：安静的首页、仿微信的朋友圈展示页，以及婚纱照相册骨架。仅作展示，不含上传、登录或支付。

基于 **Nuxt 4**（当前 npm `latest`），不使用 Fireclaw / `@nuxt/content` 等额外模块。朋友圈与婚纱照数据放在仓库根目录的 `data/*.ts`，之后会换成真实接口。

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

## 功能

- 首页：云枫简介，进入「朋友圈」与「婚纱照」
- 朋友圈：封面、头像、动态流、1/2/3/4/9 图宫格、点赞与评论展示、点击图片全屏预览
- 婚纱照：主视觉、我们的故事、全部 / 外景 / 室内分组、多列瀑布流（横图只占一列）、空状态、图片预览
- 顶部导航：首页 / 朋友圈 / 婚纱照

当前图片均为网络占位图（Unsplash 等）。`data/moments.ts` 与 `data/wedding.ts` 里的 mock 之后会换成真实接口。

## 技术栈与模块

需要的：

- Nuxt 4 + Vue 3 + TypeScript
- `sass`：页面使用嵌套 SCSS

不需要、也没有安装的：

- **Fireclaw**：不是 Nuxt 网站模块（偏 OpenClaw / 微虚拟机），与本展示站无关
- **@nuxt/content**（没有叫 Content 7 的官方包；当前是 Content v3）：适合 markdown 文档/博客。本站是页面 + mock 数据，等接 API，不必上内容引擎
- 上传 / CMS / 登录 / 支付相关模块

以后如果要优化远程图片，可以再考虑 `@nuxt/image`，现在用普通 `<img>` 即可。

## 目录

```
app/            # Nuxt 4 前端源码
  pages/
  components/
  layouts/
  assets/styles/
  app.vue
data/           # mock 数据（根目录，~~/data）
public/
nuxt.config.ts
```

## 编码约定

- 页面与组件使用 `<script setup lang="ts">` + `<template>` + `<style lang="scss" scoped>`
- SCSS 采用嵌套写法（BEM 友好），不写扁平并列选择器
- 函数与非平凡变量上方附简短中文注释
- TypeScript 保持轻量：基础类型即可，复杂对象用 `any` 或不写显式类型
- 逻辑尽量写在页面/组件内，避免过深抽象
