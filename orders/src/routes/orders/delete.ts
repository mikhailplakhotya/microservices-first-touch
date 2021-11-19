import express, { Request, Response } from 'express'
import {
  routes,
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from '@batbat/common'

import Order from '../../models/Order'
import OrderCancelledPublisher from '../../events/publishers/orderCancelledPublisher'
import { natsWrapper } from '../../events/nats-wrapper'

const router = express.Router()

router.delete(
  routes.orders.delete.path,
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params

    const order = await Order.findById(id).populate(
      'product'
    )

    if (!order) {
      throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }

    order.status = OrderStatus.Cancelled
    await order.save()

    await new OrderCancelledPublisher(
      natsWrapper.client
    ).publish({
      id: order.id,
      version: order.version,
      product: {
        id: order.product.id,
      },
    })

    res.status(204).send()
  }
)

export { router as deletedOrder }
