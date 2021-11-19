import express, { Request, Response } from 'express'
import { routes } from '@batbat/common'

import { Product } from '../../models/Product'

const router = express.Router()

router.get(
  routes.products.readList.path,
  async (req: Request, res: Response) => {
    const products = await Product.find({})

    res.send(products)
  }
)

export { router as getProductsListRouter }
