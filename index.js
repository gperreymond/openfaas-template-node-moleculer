const { ServiceBroker } = require('moleculer')
const ApiService = require('moleculer-web')

const broker = new ServiceBroker({
  metrics: false,
  logger: true,
  validation: true,
  async started () {
    broker.logger.warn('Broker started')
  },
  stopped: async () => {
    broker.logger.warn('Broker stopped')
  }
})

const start = async () => {
  // Load API Gateway
  broker.createService({
    mixins: [ApiService],
    settings: {
      port: 3022,
      ip: '0.0.0.0',
      path: '/function'
    }
  })
  // Load all domains as services
  await broker.loadServices()
  await broker.start()
}

start()
