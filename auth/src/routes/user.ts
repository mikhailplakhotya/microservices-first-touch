import express, { Request, Response } from 'express'
import { currentUser } from '@batbat/common'
import { routes } from '@batbat/common'

const router = express.Router()

router.get(
  routes.auth.user.path,
  currentUser,
  (req: Request, res: Response) => {
    return res.send({ user: req.currentUser || null })
  }
)

export { router as userRouter }
