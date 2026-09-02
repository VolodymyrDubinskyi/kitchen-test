import { productIdSchema, productInputSchema } from '@kitchen/schemas'
import { ApiError } from '@kitchen/utils'

import { deleteProduct, fetchProduct, updateProduct } from '../../../server/dummyjson/products'
import { createApiHandler } from '../../../server/http/api-handler'

const BAD_REQUEST = 400

function parseProductId(value: unknown): number {
  const parsed = productIdSchema.safeParse(value)

  if (!parsed.success) {
    throw new ApiError(BAD_REQUEST, 'Product id must be a positive whole number')
  }

  return parsed.data
}

export default createApiHandler({
  GET: async (req, res) => {
    res.status(200).json(await fetchProduct(parseProductId(req.query.id)))
  },
  PUT: async (req, res) => {
    const id = parseProductId(req.query.id)

    res.status(200).json(await updateProduct(id, productInputSchema.parse(req.body)))
  },
  DELETE: async (req, res) => {
    res.status(200).json(await deleteProduct(parseProductId(req.query.id)))
  },
})
