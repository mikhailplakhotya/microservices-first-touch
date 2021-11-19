import {
  Listener,
  OrderCancelledEvent,
  Subjects,
} from '@batbat/common'
import queueGroupName from './queue-group-name'
import { Message } from 'node-nats-streaming'
import { Product } from '../../models/Product'
import { ProductUpdatedPublisher } from '../publishers/product-updated-publisher'

export default class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
  queueGroupName = queueGroupName

  async onMessage(
    data: OrderCancelledEvent['data'],
    msg: Message
  ) {
    const product = await Product.findById(
      data.product.id
    )
    if (!product) {
      throw new Error(
        'Product not found in OrderCancelledListener'
      )
    }

    product.set({ orderId: undefined })
    await product.save()
    await new ProductUpdatedPublisher(
      this.client
    ).publish({
      id: product.id,
      price: product.price,
      title: product.title,
      orderId: product.orderId,
      userId: product.userId,
      version: product.version,
    })

    msg.ack()
  }
}
