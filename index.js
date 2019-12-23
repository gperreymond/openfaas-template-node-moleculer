const Hapi = require('@hapi/hapi')
const { ServiceBroker } = require('moleculer')

const gateway = new Hapi.Server()

const broker = new ServiceBroker({
  metrics: false,
  logger: true,
  validation: true,
  async started () {
    broker.logger.warn('Broker started')
    await gateway.start()
  },
  stopped: async () => {
    broker.logger.warn('Broker stopped')
  }
})

const start = async () => {
  await broker.loadServices()
  await broker.start()
}

start()
