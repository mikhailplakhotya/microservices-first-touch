import request from 'supertest'
import { routes } from '@batbat/common'
import app from '../../app'

it('returns a 201 on successful signup', async () =>
  request(app)
    .post(routes.auth.signup.URN())
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201))

it('returns a 400 with invalid email', async () =>
  request(app)
    .post(routes.auth.signup.URN())
    .send({
      email: 'invalidmail.com',
      password: 'password',
    })
    .expect(400))

it('returns a 400 with invalid password', async () =>
  request(app)
    .post(routes.auth.signup.URN())
    .send({
      email: 'valid@mail.com',
      password: 'ps',
    })
    .expect(400))

it('returns a 400 with missing email or password', async () => {
  await request(app)
    .post(routes.auth.signup.URN())
    .send({
      email: 'valid@mail.com',
      password: '',
    })
    .expect(400)

  await request(app)
    .post(routes.auth.signup.URN())
    .send({
      email: '',
      password: 'validpassword',
    })
    .expect(400)
})

it('disallow duplicate emails', async () => {
  await request(app)
    .post(routes.auth.signup.URN())
    .send({
      email: 'valid@email.com',
      password: 'validpassword',
    })
    .expect(201)

  await request(app)
    .post(routes.auth.signup.URN())
    .send({
      email: 'valid@email.com',
      password: 'validpassword',
    })
    .expect(400)
})

it('sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post(routes.auth.signup.URN())
    .send({
      email: 'valid@email.com',
      password: 'validpassword',
    })
    .expect(201)

  expect(response.get('Set-Cookie')).toBeDefined()
})
