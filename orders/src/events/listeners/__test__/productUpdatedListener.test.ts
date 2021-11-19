import ProductUpdatedListener from '../productUpdatedListener'
import { ProductUpdatedEvent } from '@batbat/common'
import { natsWrapper } from '../../nats-wrapper'
import mongoose from 'mongoose'
import Product from '../../../models/Product'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new ProductUpdatedListener(
    natsWrapper.client
  )

  const product = Product.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'Test title',
    price: 25,
  })
  await product.save()

  const data: ProductUpdatedEvent['data'] = {
    id: product.id,
    version: product.version + 1,
    title: 'Test Title 2',
    price: 50,
    userId: '123',
  }

  /** @ts-ignore */
  const msg: Message = {
    ack: jest.fn(),
  }

  return { msg, data, product, listener }
}

it('finds, update, and saves a product', async () => {
  const { msg, data, product, listener } =
    await setup()

  await listener.onMessage(data, msg)

  const updatedProduct = await Product.findById(
    product.id
  )

  expect(updatedProduct!.title).toEqual(data.title)
  expect(updatedProduct!.price).toEqual(data.price)
  expect(updatedProduct!.version).toEqual(data.version)
})

it('acks the message', async () => {
  const { msg, data, product, listener } =
    await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if event is not in correct order', async () => {
  const { msg, data, listener } = await setup()

  ++data.version
  try {
    await listener.onMessage(data, msg)
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled()
})
