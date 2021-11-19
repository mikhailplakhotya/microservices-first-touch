import request from 'supertest'
import { routes } from '@batbat/common'
import app from '../../app'

it('response with details about current user', async () => {
  const cookie = await global.signup()

  const response = await request(app)
    .get(routes.auth.user.URN())
    .set('Cookie', cookie)
    .send()
    .expect(200)

  expect(response.body.user.email).toEqual(
    'test@test.com'
  )
})

it('response with null if not authenticated', async () => {
  const response = await request(app)
    .get(routes.auth.user.URN())
    .send()
    .expect(200)

  expect(response.body.user).toEqual(null)
})
