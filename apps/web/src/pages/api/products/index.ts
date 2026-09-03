import { productInputSchema, productListParamsSchema } from '@kitchen/schemas'

import { createApiHandler } from '../../../server/http/api-handler'
import { createProduct, listProducts } from '../../../server/products/service'

export default createApiHandler({
  GET: async (req, res) => {
    res.status(200).json(await listProducts(productListParamsSchema.parse(req.query)))
  },
  POST: async (req, res) => {
    res.status(201).json(await createProduct(productInputSchema.parse(req.body)))
  },
})
