import {
  Publisher,
  Subjects,
  ProductUpdatedEvent,
} from '@batbat/common'

export class ProductUpdatedPublisher extends Publisher<ProductUpdatedEvent> {
  readonly subject = Subjects.ProductUpdated
}
