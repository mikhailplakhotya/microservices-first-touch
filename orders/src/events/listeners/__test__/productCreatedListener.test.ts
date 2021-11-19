import ProductCreatedListener from '../productCreatedListener'
import { natsWrapper } from '../../nats-wrapper'
import { ProductCreatedEvent } from '@batbat/common'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'
import Product from '../../../models/Product'

const setup = async () => {
  const listener = new ProductCreatedListener(
    natsWrapper.client
  )
  const data: ProductCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Test title',
    price: 15,
    userId:
      new mongoose.Types.ObjectId().toHexString(),
  }

  /** @ts-ignore */
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg }
}

it('Creates and saves a product', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  const product = await Product.findById(data.id)

  expect(product).toBeDefined()
  expect(product!.title).toEqual(data.title)
  expect(product!.price).toEqual(data.price)
})

it('Acks the msg ', async () => {
  const { data, listener, msg } = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})
