export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024
export const MAX_STORED_IMAGES = 50

export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/avif',
] as const

export type StoredImage = {
  contentType: string
  bytes: Buffer
}

const STORE_KEY = Symbol.for('kitchen.upload-store')

type StoreHolder = { [STORE_KEY]?: Map<string, StoredImage> }

export function uploadStore(): Map<string, StoredImage> {
  const holder = globalThis as StoreHolder

  holder[STORE_KEY] ??= new Map()

  return holder[STORE_KEY]
}

export function resetUploadStore(): void {
  ;(globalThis as StoreHolder)[STORE_KEY] = new Map()
}

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]

export function isAllowedImageType(value: string | undefined): value is AllowedImageType {
  return ALLOWED_IMAGE_TYPES.some(allowed => allowed === value)
}

export function storeImage(id: string, image: StoredImage): void {
  const store = uploadStore()

  while (store.size >= MAX_STORED_IMAGES) {
    const oldest = store.keys().next()

    if (oldest.done) {
      break
    }

    store.delete(oldest.value)
  }

  store.set(id, image)
}

export function readImage(id: string): StoredImage | undefined {
  return uploadStore().get(id)
}
