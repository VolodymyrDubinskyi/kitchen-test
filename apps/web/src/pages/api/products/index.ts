import { productInputSchema, productListParamsSchema } from '@kitchen/schemas'

import { createProduct, fetchProductPage } from '../../../server/dummyjson/products'
import { createApiHandler } from '../../../server/http/api-handler'

export default createApiHandler({
  GET: async (req, res) => {
    res.status(200).json(await fetchProductPage(productListParamsSchema.parse(req.query)))
  },
  POST: async (req, res) => {
    res.status(201).json(await createProduct(productInputSchema.parse(req.body)))
  },
})
