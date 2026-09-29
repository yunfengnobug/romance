// 婚纱照对接 admin 公开接口。分类由后台配置，前端不写死 外景/室内，也不使用 yunfeng 的 draft/final/base。
//
// 约定（admin 尚未落地时以此为准，romance 不连库）：
//   GET {adminApiBase}/api/public/wedding/album
//   {
//     code: 0,
//     data: {
//       cover?: string,
//       categories: [{ id, slug | name, label | name, sort_order }],
//       photos: [{ id, url, category_id | category_slug, sort_order, alt? }]
//     }
//   }
// 若 album 尚未提供，会再试：
//   GET /api/public/wedding/categories
//   GET /api/public/wedding/photos
// Tab = 「全部」+ data.categories（按 sort_order）。公开接口不带 cookie。

import { adminApiBase, pickList, pickUrl, readErrorMessage, unwrapPayload } from './momentsApi'

/** 是否强制走仓库 mock（调试用） */
export function weddingUseMock(): boolean {
  const raw = String(useRuntimeConfig().public.weddingUseMock || '').toLowerCase()
  return raw === '1' || raw === 'true' || raw === 'yes'
}

/** 拉整本相册：分类 + 照片。缺 album 时回退拆开的两个公开接口。 */
export async function fetchWeddingAlbum() {
  try {
    return mapWeddingAlbum(await weddingPublicGet('/api/public/wedding/album'))
  }
  catch (err: any) {
    if (!isNotFound(err)) throw err
    try {
      const [categoriesRaw, photosRaw] = await Promise.all([
        weddingPublicGet('/api/public/wedding/categories'),
        weddingPublicGet('/api/public/wedding/photos'),
      ])
      return mapWeddingAlbum({
        categories: coerceList(categoriesRaw, 'categories'),
        photos: coerceList(photosRaw, 'photos'),
      })
    }
    catch (splitErr: any) {
      throw wrapWeddingError(isNotFound(splitErr) ? err : splitErr)
    }
  }
}

/** 把接口信封收成页面用的 { cover, categories, photos } */
export function mapWeddingAlbum(raw: any) {
  const data = unwrapAlbumPayload(raw)
  if (looksLikeYunfengBuckets(data)) {
    throw new Error('接口返回的是初修/精修/底图，romance 需要后台动态分类（categories + photos）')
  }

  const categories = pickCategories(data)
    .map(mapWeddingCategory)
    .filter((item: any) => item.slug && item.label)
    .sort((a: any, b: any) => a.sort_order - b.sort_order)

  const photos = pickPhotos(data)
    .map((item: any) => mapWeddingPhoto(item, categories))
    .filter((item: any) => item.src)
    .sort((a: any, b: any) => a.sort_order - b.sort_order)

  return {
    cover: pickCover(data, photos),
    categories,
    photos,
  }
}

/** 调试 mock 走同一套映射，避免页面再写死分组 */
export function albumFromMock(categories: any[], photos: any[]) {
  return mapWeddingAlbum({ categories, photos })
}

/** 封面：接口 cover，否则第一张照片 */
export function pickWeddingCover(album: any): string {
  if (!album) return ''
  return album.cover || album.photos?.[0]?.src || ''
}

function unwrapAlbumPayload(raw: any): any {
  if (raw == null) return {}
  if (Array.isArray(raw)) return { photos: raw }
  if (raw.categories != null || raw.photos != null) return raw
  return unwrapPayload(raw) || {}
}

function pickCategories(data: any): any[] {
  if (!data || typeof data !== 'object') return []
  for (const key of ['categories', 'groups', 'tabs']) {
    if (Array.isArray(data[key])) return data[key]
  }
  return []
}

function pickPhotos(data: any): any[] {
  if (!data || typeof data !== 'object') return []
  if (Array.isArray(data.photos)) return data.photos
  return pickList(data)
}

function coerceList(raw: any, key: string): any[] {
  const data = unwrapAlbumPayload(raw)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.[key])) return data[key]
  return pickList(data)
}

function mapWeddingCategory(item: any) {
  const row = item && typeof item === 'object' ? item : {}
  const id = row.id ?? row._id ?? ''
  const slug = row.slug || row.name || row.key || (id !== '' ? String(id) : '')
  const label = row.label || row.title || row.name || slug
  return {
    id: id !== '' ? String(id) : String(slug),
    slug: String(slug),
    label: String(label),
    sort_order: Number(row.sort_order ?? row.sortOrder ?? 0),
  }
}

function mapWeddingPhoto(item: any, categories: any[]) {
  const row = item && typeof item === 'object' ? item : {}
  const src = pickUrl(row)
  const categoryId = row.category_id ?? row.categoryId ?? row.category?.id
  const categorySlug = row.category_slug ?? row.categorySlug ?? row.category?.slug ?? row.group ?? row.category
  const matched = categories.find((cat: any) => {
    if (categoryId != null && String(cat.id) === String(categoryId)) return true
    if (categorySlug != null && String(cat.slug) === String(categorySlug)) return true
    return false
  })
  const categoryKey = matched?.slug || (categorySlug != null && typeof categorySlug !== 'object' ? String(categorySlug) : '')
  return {
    id: String(row.id ?? row._id ?? src),
    src,
    alt: row.alt || row.title || matched?.label || '婚纱照',
    categoryKey,
    sort_order: Number(row.sort_order ?? row.sortOrder ?? 0),
  }
}

function pickCover(data: any, photos: any[]): string {
  const fromApi = pickUrl(data.cover) || pickUrl(data.cover_url) || pickUrl(data.coverUrl)
  if (fromApi) return fromApi
  const flagged = photos.find((item: any) => item.cover || item.is_cover || item.isCover)
  return flagged?.src || photos[0]?.src || ''
}

/** yunfeng 现网桶结构，不能当成 romance 的分类模型 */
function looksLikeYunfengBuckets(data: any): boolean {
  if (!data || typeof data !== 'object') return false
  const hasBuckets = Array.isArray(data.draft) || Array.isArray(data.final) || Array.isArray(data.base)
  const hasAlbum = Array.isArray(data.categories) || Array.isArray(data.photos)
  return hasBuckets && !hasAlbum
}

async function weddingPublicGet(path: string) {
  const url = `${adminApiBase()}${path}`
  try {
    return await $fetch(url, {
      method: 'GET',
      credentials: 'omit',
      headers: { Accept: 'application/json' },
    })
  }
  catch (err: any) {
    throw wrapWeddingError(err)
  }
}

function wrapWeddingError(err: any) {
  const status = err?.statusCode || err?.status
  const message = status === 404
    ? '后台尚未提供婚纱照公开接口。需要 GET /api/public/wedding/album（或 categories + photos）。'
    : readErrorMessage(err)
  const wrapped: any = new Error(message)
  wrapped.statusCode = status
  wrapped.data = err?.data
  return wrapped
}

function isNotFound(err: any): boolean {
  return (err?.statusCode || err?.status) === 404
}
