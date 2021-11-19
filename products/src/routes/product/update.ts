import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  routes,
  BadRequestError,
} from '@batbat/common'

import { Product } from '../../models/Product'
import { ProductUpdatedPublisher } from '../../events/publishers/product-updated-publisher'
import { natsWrapper } from '../../events/nats-wrapper'

const router = express.Router()

router.put(
  routes.products.update.path,
  requireAuth,
  [
    body('title')
      .not()
      .isEmpty()
      .withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater then 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const product = await Product.findById(
      req.params.id
    )

    if (!product) throw new NotFoundError()
    if (product.orderId) {
      throw new BadRequestError(
        'Cannot edit reserved product'
      )
    }
    if (product.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    product.set({
      title: req.body.title,
      price: req.body.price,
    })
    const { version: versionBefore } = product
    const { version: versionAfter } =
      await product.save()

    if (versionBefore === versionAfter) {
      return res.status(304).send()
    }

    await new ProductUpdatedPublisher(
      natsWrapper.client
    ).publish({
      id: product.id,
      title: product.title,
      price: product.price,
      userId: product.userId,
      version: product.version,
    })

    res.send(product)
  }
)

export { router as updateProductRouter }
