import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'

import { userRouter } from './routes/user'
import { loginRouter } from './routes/login'
import { logoutRouter } from './routes/logout'
import { signupRouter } from './routes/signup'

import {
  errorHandler,
  NotFoundError,
} from '@batbat/common'

const app = express()
app.set('trust proxy', true)
app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
)

app.use(userRouter)
app.use(loginRouter)
app.use(logoutRouter)
app.use(signupRouter)

app.all('*', (req, res) => {
  console.log(req.path)
  throw new NotFoundError()
})
app.use(errorHandler)

export default app
