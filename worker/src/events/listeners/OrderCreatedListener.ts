import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from '@batbat/common'
import queueGroupName from '../queueGroupName'
import { Message } from 'node-nats-streaming'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
  queueGroupName = queueGroupName

  async onMessage(
    data: OrderCreatedEvent['data'],
    msg: Message
  ) {}
}
