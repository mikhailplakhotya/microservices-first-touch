import { natsWrapper } from './events/nats-wrapper'

const start = async () => {
  if (!process.env.NATS_URI)
    throw new Error('NATS_URI is undefined')
  if (!process.env.NATS_CLUSTER_ID)
    throw new Error('NATS_CLUSTER_ID is undefined')
  if (!process.env.NATS_CLIENT_ID)
    throw new Error('NATS_CLIENT_ID is undefined')

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URI
    )
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed')
      process.exit()
    })
    process.on('SIGINT', () =>
      natsWrapper.client.close()
    )
    process.on('SIGTERM', () =>
      natsWrapper.client.close()
    )
  } catch (err) {
    console.error(err)
  }
}

start()
