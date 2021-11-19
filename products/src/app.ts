import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import {
  errorHandler,
  NotFoundError,
  currentUser,
} from '@batbat/common'

import { createProductRouter } from './routes/product/create'
import { getOneProductRouter } from './routes/product/readOne'
import { getProductsListRouter } from './routes/product/readList'
import { updateProductRouter } from './routes/product/update'

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

app.use(createProductRouter)
app.use(getOneProductRouter)
app.use(getProductsListRouter)
app.use(updateProductRouter)

app.all('*', (req, res) => {
  console.log(req.path)
  throw new NotFoundError()
})
app.use(errorHandler)

export default app
