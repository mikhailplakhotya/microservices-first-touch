import request from 'supertest'
import { routes } from '@batbat/common'

import app from '../../app'

it('fails when email not exist', async () => {
  await request(app)
    .post(routes.auth.login.URN())
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400)
})

it('fails when incorrect password', async () => {
  await request(app)
    .post(routes.auth.signup.URN())
    .send({
      email: 'test@test.com',
      password: 'validpassword',
    })
    .expect(201)

  await request(app)
    .post(routes.auth.login.URN())
    .send({
      email: 'test@test.com',
      password: 'wrongpassword',
    })
    .expect(400)
})

it('responds with cookie when valid credentials', async () => {
  await request(app)
    .post(routes.auth.signup.URN())
    .send({
      email: 'test@test.com',
      password: 'validpassword',
    })
    .expect(201)

  const response = await request(app)
    .post(routes.auth.login.URN())
    .send({
      email: 'test@test.com',
      password: 'validpassword',
    })
    .expect(200)

  expect(response.get('Set-Cookie')).toBeDefined()
})
