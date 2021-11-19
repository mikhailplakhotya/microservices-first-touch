import { Product } from '../Product'

it('implements Optimistic Concurrency Control', async () => {
  const product = Product.build({
    title: 'Some title',
    price: 10,
    userId: '123',
  })
  await product.save()

  const firstInstance = await Product.findById(
    product.id
  )
  const secondInstance = await Product.findById(
    product.id
  )

  firstInstance!.set({ price: 15 })
  secondInstance!.set({ price: 30 })

  await firstInstance!.save()

  try {
    await secondInstance!.save()
  } catch (err) {
    return
  }

  throw new Error('Should not reach this point')
})

it('increment a Version number on save', async () => {
  const product = Product.build({
    title: 'Some title',
    price: 50,
    userId: '123',
  })

  await product.save()
  expect(product.version).toEqual(0)
  product.set({ price: 15 })
  await product.save()
  expect(product.version).toEqual(1)
})
