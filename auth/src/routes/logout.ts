import express from 'express'
import { routes } from '@batbat/common'

const router = express.Router()

router.post(routes.auth.logout.path, (req, res) => {
  req.session = null
  res.send({})
})

export { router as logoutRouter }
