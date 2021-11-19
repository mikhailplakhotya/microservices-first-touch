import request from 'supertest'
import { routes } from '@batbat/common'
import app from '../../app'

it('clears a cookie on logout', async () => {
  await request(app)
    .post(routes.auth.signup.URN())
    .send({
      email: 'test@test.com',
      password: 'validpassword',
    })
    .expect(201)

  const response = await request(app)
    .post(routes.auth.logout.URN())
    .send({})
    .expect(200)

  expect(response.get('Set-Cookie')[0]).toEqual(
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  )
})
