import request from 'supertest'
import { routes } from '@batbat/common'
import app from '../../../app'
import mongoose from 'mongoose'

it.todo('returns 404 if invalid id')

it('returns 404 if product not found', async () => {
  const validId =
    new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .get(routes.products.readOne.URN(validId))
    .send()
    .expect(404)
})

it('returns the product if product exist', async () => {
  const reqAttr = {
    title: 'Random title',
    price: 30,
  }

  const createResponse = await request(app)
    .post(routes.products.create.URN())
    .set('Cookie', login())
    .send(reqAttr)
    .expect(201)

  const productResponse = await request(app)
    .get(
      routes.products.readOne.URN(
        createResponse.body.id.toString()
      )
    )
    .send()
    .expect(200)

  expect(productResponse.body.title).toEqual(
    reqAttr.title
  )
  expect(productResponse.body.price).toEqual(
    reqAttr.price
  )
})
