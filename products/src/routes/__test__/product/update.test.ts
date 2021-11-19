import request from 'supertest'
import { routes } from '@batbat/common'
import app from '../../../app'
import mongoose from 'mongoose'
import { natsWrapper } from '../../../events/nats-wrapper'
import { Product } from '../../../models/Product'

const reqAttr = {
  title: 'Random title',
  price: 30,
}
const createProduct = () => {
  return request(app)
    .post(routes.products.create.URN())
    .set('Cookie', login())
    .send(reqAttr)
}

it('returns 404 if provided id does not exist', async () => {
  const validId =
    new mongoose.Types.ObjectId().toHexString()

  await request(app)
    .put(routes.products.update.URN(validId))
    .set('Cookie', login())
    .send(reqAttr)
    .expect(404)
})

it('returns 401 if user is not authenticated', async () => {
  const validId =
    new mongoose.Types.ObjectId().toHexString()

  await request(app)
    .put(routes.products.update.URN(validId))
    .send(reqAttr)
    .expect(401)
})

it('returns 401 if user does not own the ticket', async () => {
  const response = await createProduct()

  await request(app)
    .put(routes.products.update.URN(response.body.id))
    .set('Cookie', login())
    .send({
      title: 'New Random Title',
      price: 38,
    })
    .expect(401)
})

it('returns 400 if user provides invalid title or price', async () => {
  const cookie = login()

  const createdProduct = await request(app)
    .post(routes.products.create.URN())
    .set('Cookie', cookie)
    .send(reqAttr)
    .expect(201)

  await request(app)
    .put(
      routes.products.update.URN(
        createdProduct.body.id
      )
    )
    .set('Cookie', cookie)
    .send({
      price: 38,
    })
    .expect(400)
  await request(app)
    .put(
      routes.products.update.URN(
        createdProduct.body.id
      )
    )
    .set('Cookie', cookie)
    .send({
      title: 'Title',
    })
    .expect(400)
  await request(app)
    .put(
      routes.products.update.URN(
        createdProduct.body.id
      )
    )
    .set('Cookie', cookie)
    .send({
      title: '',
      price: '',
    })
    .expect(400)
  await request(app)
    .put(
      routes.products.update.URN(
        createdProduct.body.id
      )
    )
    .set('Cookie', cookie)
    .send({
      title: 'Valid title',
      price: -12,
    })
    .expect(400)
})

it('updates a ticket with valid inputs', async () => {
  const cookie = login()

  const updateAttr = {
    title: 'Valid New title',
    price: 100,
  }
  const createdRes = await request(app)
    .post(routes.products.create.URN())
    .set('Cookie', cookie)
    .send(reqAttr)
    .expect(201)

  const updatedRes = await request(app)
    .put(
      routes.products.update.URN(createdRes.body.id)
    )
    .set('Cookie', cookie)
    .send(updateAttr)
    .expect(200)

  expect(updatedRes.body.title).toEqual(
    updateAttr.title
  )
  expect(updatedRes.body.price).toEqual(
    updateAttr.price
  )
})

it('publish an UPDATE event', async () => {
  const cookie = login()

  const updateAttr = {
    title: 'Valid New title',
    price: 100,
  }
  const createdRes = await request(app)
    .post(routes.products.create.URN())
    .set('Cookie', cookie)
    .send(reqAttr)
    .expect(201)

  await request(app)
    .put(
      routes.products.update.URN(createdRes.body.id)
    )
    .set('Cookie', cookie)
    .send(updateAttr)
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('rejects updates if product is reserved', async () => {
  const cookie = login()

  const updateAttr = {
    title: 'Valid New title',
    price: 100,
  }
  const createdRes = await request(app)
    .post(routes.products.create.URN())
    .set('Cookie', cookie)
    .send(reqAttr)
    .expect(201)

  const product = await Product.findById(
    createdRes.body.id
  )
  product!.set({
    orderId: mongoose.Types.ObjectId().toHexString(),
  })
  await product!.save()

  await request(app)
    .put(
      routes.products.update.URN(createdRes.body.id)
    )
    .set('Cookie', cookie)
    .send(updateAttr)
    .expect(400)
})
