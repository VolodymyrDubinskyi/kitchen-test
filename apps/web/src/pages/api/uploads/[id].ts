import { ApiError } from '@kitchen/utils'

import { createApiHandler } from '../../../server/http/api-handler'
import { readImage } from '../../../server/uploads/store'

const NOT_FOUND = 404

export default createApiHandler({
  GET: async (req, res) => {
    const id = typeof req.query.id === 'string' ? req.query.id : ''
    const image = readImage(id)

    if (!image) {
      throw new ApiError(NOT_FOUND, 'That image is no longer available')
    }

    res.setHeader('content-type', image.contentType)
    res.setHeader('cache-control', 'private, max-age=3600')
    res.status(200).send(image.bytes)
  },
})
