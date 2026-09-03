import { Readable } from 'node:stream'

import { beforeEach, describe, expect, it } from 'vitest'

import { ApiError } from '@kitchen/utils'

import { readBodyWithLimit } from './read-body'
import {
  isAllowedImageType,
  MAX_STORED_IMAGES,
  readImage,
  resetUploadStore,
  storeImage,
  uploadStore,
} from './store'

function image(byte: number) {
  return { contentType: 'image/png', bytes: Buffer.from([byte]) }
}

beforeEach(() => {
  resetUploadStore()
})

describe('isAllowedImageType', () => {
  it.each(['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'])(
    'accepts %s',
    type => {
      expect(isAllowedImageType(type)).toBe(true)
    },
  )

  it.each(['text/html', 'application/json', 'image/svg+xml', undefined])('rejects %s', type => {
    expect(isAllowedImageType(type)).toBe(false)
  })
})

describe('storeImage', () => {
  it('round-trips an image', () => {
    storeImage('a', image(1))

    expect(readImage('a')).toEqual(image(1))
  })

  it('returns nothing for an unknown id', () => {
    expect(readImage('missing')).toBeUndefined()
  })

  it('evicts the oldest image once the cap is reached, so memory cannot grow forever', () => {
    for (let index = 0; index < MAX_STORED_IMAGES; index += 1) {
      storeImage(`image-${index}`, image(index))
    }

    storeImage('newest', image(255))

    expect(uploadStore().size).toBe(MAX_STORED_IMAGES)
    expect(readImage('image-0')).toBeUndefined()
    expect(readImage('newest')).toBeDefined()
  })
})

describe('readBodyWithLimit', () => {
  it('collects the whole body when it fits', async () => {
    const body = await readBodyWithLimit(Readable.from([Buffer.from('ab'), Buffer.from('c')]), 10)

    expect(body.toString()).toBe('abc')
  })

  it('stops as soon as the limit is passed instead of buffering everything', async () => {
    const stream = Readable.from([Buffer.alloc(8), Buffer.alloc(8)])

    await expect(readBodyWithLimit(stream, 10)).rejects.toBeInstanceOf(ApiError)
  })

  it('reports the oversized body as 413', async () => {
    await expect(readBodyWithLimit(Readable.from([Buffer.alloc(20)]), 10)).rejects.toMatchObject({
      status: 413,
    })
  })
})
