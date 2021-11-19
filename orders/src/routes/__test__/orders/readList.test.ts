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

it('Fetches Orders for particular User', async () => {
  const productOne = await buildProduct()
  const productTwo = await buildProduct()
  const productThree = await buildProduct()

  const userOne = login()
  const userTwo = login()

  await request(app)
    .post(routes.orders.create.URN())
    .set('Cookie', userOne)
    .send({ productId: productOne.id })
    .expect(201)

  const { body: orderOne } = await request(app)
    .post(routes.orders.create.URN())
    .set('Cookie', userTwo)
    .send({ productId: productTwo.id })
    .expect(201)

  const { body: orderTwo } = await request(app)
    .post(routes.orders.create.URN())
    .set('Cookie', userTwo)
    .send({ productId: productThree.id })
    .expect(201)

  const responseUserTwo = await request(app)
    .get(routes.orders.readList.URN())
    .set('Cookie', userTwo)
    .expect(200)

  expect(responseUserTwo.body.length).toEqual(2)
  expect(responseUserTwo.body[0].id).toEqual(
    orderOne.id
  )
  expect(responseUserTwo.body[1].id).toEqual(
    orderTwo.id
  )
  expect(responseUserTwo.body[0].product.id).toEqual(
    productTwo.id
  )
  expect(responseUserTwo.body[1].product.id).toEqual(
    productThree.id
  )
})
