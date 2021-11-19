import request from 'supertest'
import { routes } from '@batbat/common'
import mongoose from 'mongoose'
import app from '../../../app'

import Product from '../../../models/Product'

const buildProduct = async () => {
  const product = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Product',
    price: 10,
  })
  await product.save()

  return product
}

it('fetches the order', async () => {
  const product = await buildProduct()
  const user = login()

  const { body: order } = await request(app)
    .post(routes.orders.create.URN())
    .set('Cookie', user)
    .send({ productId: product.id })
    .expect(201)

  const { body: fetchedOrder } = await request(app)
    .get(routes.orders.readOne.URN(order.id))
    .set('Cookie', user)
    .send()
    .expect(200)

  expect(fetchedOrder.id).toEqual(order.id)
  expect(fetchedOrder.product.id).toEqual(product.id)
})

it('returns an error trying to fetch other user order', async () => {
  const product = await buildProduct()
  const user = login()

  const { body: order } = await request(app)
    .post(routes.orders.create.URN())
    .set('Cookie', user)
    .send({ productId: product.id })
    .expect(201)

  await request(app)
    .get(routes.orders.readOne.URN(order.id))
    .set('Cookie', login())
    .send()
    .expect(401)
})
