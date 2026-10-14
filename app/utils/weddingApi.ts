// 婚纱照对接 admin 公开接口。分类由后台配置，前端不写死分组，也不使用 yunfeng 的 draft/final/base。
//
// 约定（admin 单独落地，路径若微调可再对齐）：
//   GET {adminApiBase}/api/public/wedding/categories
//   GET {adminApiBase}/api/public/wedding/photos?page=&limit=
//   {
//     code: 0,
//     data: [{ id, slug?, label, sort_order }]
//     或 { categories: [...], photos: [...], total, page, limit }
//   }
// 照片接口分页（默认 48、上限 100），客户端按 total 翻页收齐。
// 照片字段：{ id, url, category_id | category_slug, sort_order, alt? }
// Tab = 「全部」+ categories.label。公开接口不带 cookie。
// 接口未合并（404）或空列表：空相册，不回退 Unsplash。

import { adminPublicGet, pickList, pickUrl, readErrorMessage, unwrapPayload } from './momentsApi'

const CATEGORIES_PATH = '/api/public/wedding/categories'
const PHOTOS_PATH = '/api/public/wedding/photos'
/** 公开照片接口默认 48、上限 100；单次拉不全时按 total 翻页 */
const PHOTO_PAGE_SIZE = 100

/** 是否强制走仓库 mock（调试用） */
export function weddingUseMock(): boolean {
  const raw = String(useRuntimeConfig().public.weddingUseMock || '').toLowerCase()
  return raw === '1' || raw === 'true' || raw === 'yes'
}

/** 并行拉分类 + 照片。照片按 page/limit 收齐，404 / 空列表当成等待态，不抛错。 */
export async function fetchWeddingAlbum() {
  const [categoriesRes, photosRes] = await Promise.all([
    weddingPublicGet(CATEGORIES_PATH),
    weddingPublicGet(photosPagePath(1)),
  ])

  const hard = [categoriesRes, photosRes].find((item: any) => item.error && !item.missing)
  if (hard) throw hard.error

  const waiting = categoriesRes.missing && photosRes.missing
  return {
    ...mapWeddingAlbum({
      categories: categoriesRes.missing ? [] : coerceList(categoriesRes.data, 'categories'),
      photos: photosRes.missing ? [] : await collectWeddingPhotos(photosRes.data),
    }),
    waiting,
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
    .filter((item: any) => item.label && (item.id || item.slug))
    .sort((a: any, b: any) => a.sort_order - b.sort_order)

  const photos = pickPhotos(data)
    .map((item: any) => mapWeddingPhoto(item, categories))
    .filter((item: any) => item.src)
    .sort((a: any, b: any) => a.sort_order - b.sort_order)

  return {
    cover: pickCover(data, photos),
    categories,
    photos,
    waiting: false,
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

/** 当前 tab 是否包含这张照片（id 或 slug 都能对上） */
export function photoMatchesGroup(photo: any, key: string): boolean {
  if (!photo || key === 'all') return true
  const keys = [photo.categoryId, photo.categorySlug, photo.categoryKey].filter(Boolean).map(String)
  return keys.includes(String(key))
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
  if (raw == null) return []
  if (Array.isArray(raw)) return raw
  const data = unwrapAlbumPayload(raw)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.[key])) return data[key]
  const listed = pickList(data)
  if (listed.length) return listed
  return []
}

function mapWeddingCategory(item: any) {
  const row = item && typeof item === 'object' ? item : {}
  const id = row.id ?? row._id ?? ''
  const slug = row.slug || row.name || row.key || ''
  const label = row.label || row.title || row.name || slug
  return {
    id: id !== '' ? String(id) : '',
    slug: String(slug || (id !== '' ? String(id) : '')),
    label: String(label || ''),
    sort_order: Number(row.sort_order ?? row.sortOrder ?? 0),
    tabKey: id !== '' ? String(id) : String(slug),
  }
}

function mapWeddingPhoto(item: any, categories: any[]) {
  const row = item && typeof item === 'object' ? item : {}
  const src = pickUrl(row)
  const categoryId = row.category_id ?? row.categoryId ?? row.category?.id
  const categorySlug = row.category_slug ?? row.categorySlug ?? row.category?.slug ?? row.group
  const slugValue = categorySlug != null && typeof categorySlug !== 'object' ? String(categorySlug) : ''
  const matched = categories.find((cat: any) => {
    if (categoryId != null && cat.id && String(cat.id) === String(categoryId)) return true
    if (slugValue && cat.slug && String(cat.slug) === slugValue) return true
    return false
  })
  return {
    id: String(row.id ?? row._id ?? src),
    src,
    alt: row.alt || row.title || matched?.label || '婚纱照',
    categoryId: categoryId != null ? String(categoryId) : matched?.id || '',
    categorySlug: slugValue || matched?.slug || '',
    categoryKey: matched?.tabKey || (categoryId != null ? String(categoryId) : slugValue),
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

/** 第一页不够时按 total 把后续页并行拉齐，避免后几个分类空 tab */
async function collectWeddingPhotos(firstRaw: any): Promise<any[]> {
  const firstPage = extractPhotoPage(firstRaw)
  const photos = [...firstPage.photos]
  const total = firstPage.total
  if (!photos.length || !total || photos.length >= total) return photos

  const limit = firstPage.limit || PHOTO_PAGE_SIZE
  const startPage = (firstPage.page || 1) + 1
  const lastPage = Math.min(Math.ceil(total / Math.max(limit, 1)), startPage + 50)
  const pages: number[] = []
  for (let page = startPage; page <= lastPage; page++) pages.push(page)
  if (!pages.length) return photos

  const results = await Promise.all(pages.map((page) => weddingPublicGet(photosPagePath(page, limit))))
  const hard = results.find((item: any) => item.error && !item.missing)
  if (hard) throw hard.error

  const seen = new Set(photos.map(photoId).filter(Boolean))
  for (const res of results) {
    if (res.missing) continue
    for (const item of extractPhotoPage(res.data).photos) {
      const id = photoId(item)
      if (id && seen.has(id)) continue
      if (id) seen.add(id)
      photos.push(item)
    }
  }
  return photos
}

function extractPhotoPage(raw: any): { photos: any[], total: number, page: number, limit: number } {
  const photos = coerceList(raw, 'photos')
  const data = unwrapAlbumPayload(raw)
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {}
  return {
    photos,
    total: Number(source.total ?? raw?.data?.total ?? raw?.total ?? 0) || 0,
    page: Number(source.page ?? raw?.data?.page ?? raw?.page ?? 1) || 1,
    limit: Number(source.limit ?? raw?.data?.limit ?? raw?.limit ?? PHOTO_PAGE_SIZE) || PHOTO_PAGE_SIZE,
  }
}

function photosPagePath(page: number, limit = PHOTO_PAGE_SIZE) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  return `${PHOTOS_PATH}?${query}`
}

function photoId(item: any): string {
  if (!item || typeof item !== 'object') return ''
  const id = item.id ?? item._id
  return id != null && id !== '' ? String(id) : ''
}

async function weddingPublicGet(path: string) {
  try {
    const data = await adminPublicGet(path)
    return { data, missing: false, error: null }
  }
  catch (err: any) {
    if (isNotFound(err)) return { data: null, missing: true, error: wrapWeddingError(err) }
    return { data: null, missing: false, error: wrapWeddingError(err) }
  }
}

function wrapWeddingError(err: any) {
  const status = err?.statusCode || err?.status
  const message = status === 404
    ? '后台尚未提供婚纱照公开接口。需要 GET /api/public/wedding/categories 与 /api/public/wedding/photos。'
    : readErrorMessage(err)
  const wrapped: any = new Error(message)
  wrapped.statusCode = status
  wrapped.data = err?.data
  return wrapped
}

function isNotFound(err: any): boolean {
  return (err?.statusCode || err?.status) === 404
}
