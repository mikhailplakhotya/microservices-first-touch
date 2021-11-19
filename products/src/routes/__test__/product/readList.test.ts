import request from 'supertest'
import { routes } from '@batbat/common'
import app from '../../../app'

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

it('get a list of created products', async () => {
  await createProduct()
  await createProduct()
  await createProduct()
  await createProduct()

  const response = await request(app)
    .get(routes.products.readList.URN())
    .send()
    .expect(200)

  expect(response.body.length).toEqual(4)
})
