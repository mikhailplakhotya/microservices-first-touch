import { Message } from 'node-nats-streaming'
import {
  Subjects,
  Listener,
  ProductUpdatedEvent,
} from '@batbat/common'
import queueGroupName from './queueGroupName'

import Product from '../../models/Product'

export default class ProductUpdatedListener extends Listener<ProductUpdatedEvent> {
  readonly subject = Subjects.ProductUpdated
  queueGroupName = queueGroupName

  async onMessage(
    data: ProductUpdatedEvent['data'],
    msg: Message
  ) {
    const product = await Product.findByEvent(data)

    if (!product)
      throw new Error(
        'Product not found in Updater Listener'
      )

    const { title, price } = data
    product.set({
      title,
      price,
    })
    await product.save()

    msg.ack()
  }
}
