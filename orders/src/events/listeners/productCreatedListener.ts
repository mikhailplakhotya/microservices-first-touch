import { Message } from 'node-nats-streaming'
import {
  Subjects,
  Listener,
  ProductCreatedEvent,
} from '@batbat/common'
import queueGroupName from './queueGroupName'

import Product from '../../models/Product'

export default class ProductCreatedListener extends Listener<ProductCreatedEvent> {
  readonly subject = Subjects.ProductCreated
  queueGroupName = queueGroupName

  async onMessage(
    data: ProductCreatedEvent['data'],
    msg: Message
  ) {
    const { id, title, price } = data
    const product = Product.build({
      id,
      title,
      price,
    })
    await product.save()

    msg.ack()
  }
}
