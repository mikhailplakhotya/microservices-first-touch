import mongoose from 'mongoose'
import { natsWrapper } from './events/nats-wrapper'
import app from './app'

import ProductCreatedListener from './events/listeners/productCreatedListener'
import ProductUpdatedListener from './events/listeners/productUpdatedListener'

const start = async () => {
  if (!process.env.JWT_KEY)
    throw new Error('JWT_KEY is undefined')
  if (!process.env.MONGO_URI)
    throw new Error('JWT_KEY is undefined')
  if (!process.env.NATS_URI)
    throw new Error('JWT_KEY is undefined')
  if (!process.env.NATS_CLUSTER_ID)
    throw new Error('JWT_KEY is undefined')
  if (!process.env.NATS_CLIENT_ID)
    throw new Error('JWT_KEY is undefined')

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URI
    )
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed')
      process.exit()
    })
    process.on('SIGINT', () =>
      natsWrapper.client.close()
    )
    process.on('SIGTERM', () =>
      natsWrapper.client.close()
    )

    new ProductCreatedListener(
      natsWrapper.client
    ).listen()
    new ProductUpdatedListener(
      natsWrapper.client
    ).listen()

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error(err)
  }

  app.listen(3000, () => {
    console.log('Auth Listening port 3000!')
  })
}

start()