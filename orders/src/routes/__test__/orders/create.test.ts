import request from 'supertest'
import { OrderStatus, routes } from '@batbat/common'
import mongoose from 'mongoose'
import app from '../../../app'

import Order from '../../../models/Order'
import Product from '../../../models/Product'

import { natsWrapper } from '../../../events/nats-wrapper'

it('Returns an error if Product not exist', async () => {
  const productId =
    mongoose.Types.ObjectId().toHexString()

  await request(app)
    .post(routes.orders.create.URN())
    .set('Cookie', login())
    .send({ productId })
    .expect(404)
})

it('Returns an error if Product already reserved', async () => {
  const product = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Product',
    price: 10,
  })
  await product.save()

  const order = Order.build({
    product,
    userId: '123',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  })

  await order.save()

  await request(app)
    .post(routes.orders.create.URN())
    .set('Cookie', login())
    .send({ productId: product.id })
    .expect(400)
})

it('Order a product', async () => {
  const product = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Product',
    price: 10,
  })
  await product.save()

  await request(app)
    .post(routes.orders.create.URN())
    .set('Cookie', login())
    .send({ productId: product.id })
    .expect(201)
})

it('Emits order created event', async () => {
  const product = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Product',
    price: 10,
  })
  await product.save()

  await request(app)
    .post(routes.orders.create.URN())
    .set('Cookie', login())
    .send({ productId: product.id })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
