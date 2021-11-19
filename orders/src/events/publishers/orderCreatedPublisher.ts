import {
  OrderCreatedEvent,
  Publisher,
  Subjects,
} from '@batbat/common'

export default class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated
}
