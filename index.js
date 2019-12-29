const { ServiceBroker } = require('moleculer')
const ApiService = require('moleculer-web')

const { APP_RABBITMQ_URI, APP_RABBITMQ_PREFETCH } = process.env

const configuration = {
  moleculer: {
    metrics: {
      enabled: true,
      reporter: [{
        type: 'Prometheus',
        options: {
          port: 3030,
          path: '/metrics',
          defaultLabels: registry => ({
            namespace: registry.broker.namespace,
            nodeID: registry.broker.nodeID
          })
        }
      }]
    },
    logger: true,
    validation: true,
    transporter: {
      type: 'AMQP',
      options: {
        url: APP_RABBITMQ_URI || 'amqp://infra:infra@rabbitmq.docker.localhost:5672',
        eventTimeToLive: 5000,
        prefetch: parseInt(APP_RABBITMQ_PREFETCH) || 1,
        autoDeleteQueues: true
      }
    }
  }
}

const broker = new ServiceBroker({
  ...configuration.moleculer,
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
    mixins: [ApiService]
  })
  // Load all domains as services
  await broker.loadServices()
  await broker.start()
}

start()
