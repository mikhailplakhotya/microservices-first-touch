import express, { Request, Response } from 'express'
import mongoose from 'mongoose'
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  routes,
  validateRequest,
} from '@batbat/common'
import { body } from 'express-validator'

import Product from '../../models/Product'
import Order from '../../models/Order'

import OrderCreatedPublisher from '../../events/publishers/orderCreatedPublisher'
import { natsWrapper } from '../../events/nats-wrapper'

const router = express.Router()
const EXPIRATION_WINDOW_SECONDS = 15 * 60

router.post(
  routes.orders.create.path,
  requireAuth,
  [
    body('productId')
      .not()
      .isEmpty()
      .custom((input: string) =>
        mongoose.Types.ObjectId.isValid(input)
      )
      .withMessage(
        'Valid ticketId should be provided'
      ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { productId } = req.body

    const product = await Product.findById(productId)
    if (!product) {
      throw new NotFoundError()
    }

    if (await product.isReserved()) {
      throw new BadRequestError(
        'Product is already reserved'
      )
    }

    const expiration = new Date()
    expiration.setSeconds(
      expiration.getSeconds() +
        EXPIRATION_WINDOW_SECONDS
    )

    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      product,
    })
    await order.save()

    await new OrderCreatedPublisher(
      natsWrapper.client
    ).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      version: order.version,
      product: {
        id: product.id,
        price: product.price,
      },
    })

    res.status(201).send(order)
  }
)

export { router as createOrder }
