import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@batbat/common'

import { createOrder } from './routes/orders/create'
import { readOrder } from './routes/orders/readOne'
import { readOrdersList } from './routes/orders/readList'
import { updateOrder } from './routes/orders/update'
import { deletedOrder } from './routes/orders/delete'

const app = express()

app.set('trust proxy', true)
app.use(json())
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
)
app.use(currentUser)

app.use(createOrder)
app.use(readOrder)
app.use(readOrdersList)
app.use(updateOrder)
app.use(deletedOrder)

app.all('*', (req, res) => {
  console.log(req.path)
  throw new NotFoundError()
})
app.use(errorHandler)

export default app
