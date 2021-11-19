import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import {
  validateRequest,
  BadRequestError,
} from '@batbat/common'
import { routes } from '@batbat/common'

import User from '../models/User'
import Password from '../services/Password'

const router = express.Router()

router.post(
  routes.auth.login.path,
  [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Please, supply a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body
    const existingUser = await User.findOne({ email })

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials')
    }

    const passwordMatch = await Password.compare(
      existingUser.password,
      password
    )

    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials')
    }

    /** Generate JWT */
    const userJWT = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    )

    /** Store JWT */
    req.session = {
      jwt: userJWT,
    }

    res.status(200).send(existingUser)
  }
)

export { router as loginRouter }
