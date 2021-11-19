import express, { Request, Response } from 'express'
import { NotFoundError } from '@batbat/common'
import { routes } from '@batbat/common'

import { Product } from '../../models/Product'

const router = express.Router()

router.get(
  routes.products.readOne.path,
  async (req: Request, res: Response) => {
    const product = await Product.findById(
      req.params.id
    )
    if (!product) {
      throw new NotFoundError()
    }
    res.send(product)
  }
)

export { router as getOneProductRouter }
