import { ApiError } from '@kitchen/utils'

const PAYLOAD_TOO_LARGE = 413

export type ByteStream = AsyncIterable<Buffer | string>

export async function readBodyWithLimit(stream: ByteStream, limit: number): Promise<Buffer> {
  const chunks: Buffer[] = []
  let size = 0

  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)

    size += buffer.byteLength

    if (size > limit) {
      throw new ApiError(PAYLOAD_TOO_LARGE, 'The image is larger than the 2 MB limit')
    }

    chunks.push(buffer)
  }

  return Buffer.concat(chunks)
}
