import express, { Request, Response } from 'express'
import {
  routes,
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from '@batbat/common'

import Order from '../../models/Order'

const router = express.Router()

router.get(
  routes.orders.readOne.path,
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(
      req.params.id
    ).populate('product')

    if (!order) {
      throw new NotFoundError()
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }
    res.send(order)
  }
)

export { router as readOrder }
