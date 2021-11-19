import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@batbat/common'
import queueGroupName from './queue-group-name'
import { Message } from 'node-nats-streaming'

import { Product } from '../../models/Product'
import { ProductUpdatedPublisher } from '../publishers/product-updated-publisher'

export default class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  queueGroupName = queueGroupName

  async onMessage(
    data: OrderCreatedEvent['data'],
    msg: Message
  ) {
    const product = await Product.findById(
      data.product.id
    )

    if (!product) throw new Error('Product not found')

    product.set({
      orderId: data.id,
    })
    await product.save()
    await new ProductUpdatedPublisher(
      this.client
    ).publish({
      id: product.id,
      title: product.title,
      price: product.price,
      version: product.version,
      userId: product.userId,
      orderId: data.id,
    })

    msg.ack()
  }
}
