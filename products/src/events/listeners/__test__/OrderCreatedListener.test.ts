import {
  OrderCreatedEvent,
  OrderStatus,
} from '@batbat/common'
import OrderCreatedListener from '../OrderCreatedListener'
import { natsWrapper } from '../../nats-wrapper'
import { Product } from '../../../models/Product'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new OrderCreatedListener(
    natsWrapper.client
  )

  const product = Product.build({
    title: 'Test title',
    price: 100,
    userId: '123',
  })
  await product.save()

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: '123',
    expiresAt: '123',
    version: 0,
    product: {
      id: product.id,
      price: product.price,
    },
  }

  /** @ts-ignore */
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, product, data, msg }
}

it('Set the userId on Product', async () => {
  const { listener, product, data, msg } =
    await setup()

  await listener.onMessage(data, msg)

  const updatedProduct = await Product.findById(
    product.id
  )

  expect(updatedProduct!.orderId).toEqual(data.id)
})

it('Acks the Message', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})

it('Publishes product:updated Event', async () => {
  const { listener, data, msg } = await setup()

  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const productUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock
      .calls[0][1]
  )

  expect(data.id).toEqual(productUpdatedData.orderId)
})
