import request from 'supertest'
import { routes } from '@batbat/common'
import app from '../../../app'
import { Product } from '../../../models/Product'
import { natsWrapper } from '../../../events/nats-wrapper'

it('has a route handler listening /api/products for post request', async () => {
  const response = await request(app)
    .post(routes.products.create.URN())
    .send({})

  expect(response.status).not.toEqual(404)
})

it('can only be accessed if the user is signed in', async () => {
  const response = await request(app)
    .post(routes.products.create.URN())
    .send({})
    .expect(401)
})

it('returns a status other then 401 if user signed in', async () => {
  const response = await request(app)
    .post(routes.products.create.URN())
    .set('Cookie', login())
    .send({})

  expect(response.status).not.toEqual(401)
})

it('returns an error if invalid title provided', async () => {
  await request(app)
    .post(routes.products.create.URN())
    .set('Cookie', login())
    .send({
      title: '',
      price: 10,
    })
    .expect(400)

  await request(app)
    .post(routes.products.create.URN())
    .set('Cookie', login())
    .send({
      price: 10,
    })
    .expect(400)
})

it('returns an error if invalid price provided', async () => {
  await request(app)
    .post(routes.products.create.URN())
    .set('Cookie', login())
    .send({
      title: 'Some title',
      price: '',
    })
    .expect(400)

  await request(app)
    .post(routes.products.create.URN())
    .set('Cookie', login())
    .send({
      title: 'Some title',
    })
    .expect(400)

  await request(app)
    .post(routes.products.create.URN())
    .set('Cookie', login())
    .send({
      title: 'Some title',
      price: -10,
    })
    .expect(400)
})

it('creates a product with valid inputs', async () => {
  const testTitle = 'Test title'
  let products = await Product.find({})

  expect(products.length).toEqual(0)

  await request(app)
    .post(routes.products.create.URN())
    .set('Cookie', login())
    .send({
      title: testTitle,
      price: '20',
    })
    .expect(201)

  products = await Product.find({})
  expect(products.length).toEqual(1)
  expect(products[0].title).toEqual(testTitle)
})

it('publish a create event', async () => {
  const testTitle = 'Test title'
  await request(app)
    .post(routes.products.create.URN())
    .set('Cookie', login())
    .send({
      title: testTitle,
      price: '20',
    })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
