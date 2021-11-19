import {
  Publisher,
  Subjects,
  ProductCreatedEvent,
} from '@batbat/common'

export class ProductCreatedPublisher extends Publisher<ProductCreatedEvent> {
  readonly subject = Subjects.ProductCreated
}
