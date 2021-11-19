import express, { Request, Response } from 'express'
import { routes, requireAuth } from '@batbat/common'

import Order from '../../models/Order'

const router = express.Router()

router.get(
  routes.orders.readList.path,
  requireAuth,
  async (req: Request, res: Response) => {
    const orders = await Order.find({
      userId: req.currentUser!.id,
    }).populate('product')

    res.send(orders)
  }
)

export { router as readOrdersList }
