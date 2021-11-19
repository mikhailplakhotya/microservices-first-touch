import request from 'supertest'
import { routes, OrderStatus } from '@batbat/common'
import mongoose from 'mongoose'
import app from '../../../app'

import Order from '../../../models/Order'
import Product from '../../../models/Product'

import { natsWrapper } from '../../../events/nats-wrapper'

const buildProduct = async () => {
  const product = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Product',
    price: 10,
  })
  await product.save()

  return product
}

it('marks order as cancelled', async () => {
  const product = await buildProduct()
  const user = login()

  const { body: order } = await request(app)
    .post(routes.orders.create.URN())
    .set('Cookie', user)
    .send({ productId: product.id })
    .expect(201)

  await request(app)
    .delete(routes.orders.delete.URN(order.id))
    .set('Cookie', user)
    .send()
    .expect(204)

  const updatedOrder = await Order.findById(order.id)
  expect(updatedOrder!.status).toEqual(
    OrderStatus.Cancelled
  )
})

it('Emits Order:Cancelled Event', async () => {
  const product = await buildProduct()
  const user = login()

  const { body: order } = await request(app)
    .post(routes.orders.create.URN())
    .set('Cookie', user)
    .send({ productId: product.id })
    .expect(201)

  await request(app)
    .delete(routes.orders.delete.URN(order.id))
    .set('Cookie', user)
    .send()
    .expect(204)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
