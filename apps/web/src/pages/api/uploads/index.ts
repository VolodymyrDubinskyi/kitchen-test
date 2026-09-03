import { randomUUID } from 'node:crypto'

import { ApiError } from '@kitchen/utils'

import { createApiHandler } from '../../../server/http/api-handler'
import { readBodyWithLimit } from '../../../server/uploads/read-body'
import {
  ALLOWED_IMAGE_TYPES,
  isAllowedImageType,
  MAX_UPLOAD_BYTES,
  storeImage,
} from '../../../server/uploads/store'

const UNSUPPORTED_MEDIA_TYPE = 415
const BAD_REQUEST = 400

export const config = { api: { bodyParser: false } }

export default createApiHandler({
  POST: async (req, res) => {
    const contentType = req.headers['content-type']?.split(';')[0]?.trim()

    if (!isAllowedImageType(contentType)) {
      throw new ApiError(
        UNSUPPORTED_MEDIA_TYPE,
        `The image must be one of: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
      )
    }

    const bytes = await readBodyWithLimit(req, MAX_UPLOAD_BYTES)

    if (bytes.byteLength === 0) {
      throw new ApiError(BAD_REQUEST, 'The uploaded image was empty')
    }

    const id = randomUUID()

    storeImage(id, { contentType, bytes })

    res.status(201).json({ url: `/api/uploads/${id}` })
  },
})
