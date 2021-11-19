import OrderCancelledListener from '../OrderCancelledListener'
import { natsWrapper } from '../../nats-wrapper'
import { Product } from '../../../models/Product'
import mongoose from 'mongoose'
import { OrderCancelledEvent } from '@batbat/common'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new OrderCancelledListener(
    natsWrapper.client
  )

  const orderId =
    mongoose.Types.ObjectId().toHexString()
  const product = Product.build({
    title: 'Product title',
    price: 100,
    userId: '123',
  })
  product.set({ orderId })
  await product.save()

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    product: {
      id: product.id,
    },
  }

  /** @ts-ignore */
  const msg: Message = {
    ack: jest.fn(),
  }

  return { msg, product, data, orderId, listener }
}

it('Updates a product, publishes the event and acks the message', async () => {
  const { msg, product, data, listener } =
    await setup()

  await listener.onMessage(data, msg)

  const updatedProduct = await Product.findById(
    product.id
  )
  expect(updatedProduct!.orderId).not.toBeDefined()
  expect(msg.ack).toHaveBeenCalled()
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
