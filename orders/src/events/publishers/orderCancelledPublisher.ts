import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from '@batbat/common'

export default class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled
}
