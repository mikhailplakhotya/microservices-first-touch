import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import {
  validateRequest,
  BadRequestError,
} from '@batbat/common'
import { routes } from '@batbat/common'

import User from '../models/User'

const router = express.Router()

router.post(
  routes.auth.signup.path,
  [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage(
        'Password must be at between 4 and 20 characters'
      ),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      throw new BadRequestError('Email already in use')
    }

    const user = User.build({ email, password })
    await user.save()

    /** Generate JWT */
    const userJWT = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    )

    /** Store JWT */
    req.session = {
      jwt: userJWT,
    }

    res.status(201).send(user)
  }
)

export { router as signupRouter }
