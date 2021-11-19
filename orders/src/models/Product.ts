import mongoose from 'mongoose'
import Order from './Order'
import { OrderStatus } from '@batbat/common'

interface ProductAttrs {
  id: string
  title: string
  price: number
}

export interface ProductDoc extends mongoose.Document {
  title: string
  price: number
  version: number
  isReserved(): Promise<boolean>
}

interface ProductModel
  extends mongoose.Model<ProductDoc> {
  build(attrs: ProductAttrs): ProductDoc
  findByEvent(event: {
    id: string
    version: number
  }): Promise<ProductDoc | null>
}

const ProductSchema = new mongoose.Schema<ProductDoc>(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
      },
    },
    versionKey: 'version',
    optimisticConcurrency: true,
  }
)

ProductSchema.statics.findByEvent = (event: {
  id: string
  version: number
}) => {
  return Product.findOne({
    _id: event.id,
    version: event.version - 1,
  })
}
ProductSchema.statics.build = (
  attrs: ProductAttrs
) => {
  return new Product({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  })
}
ProductSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    product: this,
    status: {
      $nin: [OrderStatus.Cancelled],
    },
  })

  return !!existingOrder
}

const Product = mongoose.model<
  ProductDoc,
  ProductModel
>('Product', ProductSchema)

export default Product
