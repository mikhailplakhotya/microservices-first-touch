import express, { Request, Response } from 'express'
import { routes } from '@batbat/common'

const router = express.Router()

router.put(
  routes.orders.update.path,
  async (req: Request, res: Response) => {
    res.send()
  }
)

export { router as updateOrder }
