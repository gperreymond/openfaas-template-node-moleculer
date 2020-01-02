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
  async started (brk) {
    brk.logger.warn('Broker started')
  },
  stopped: async (brk) => {
    brk.logger.warn('Broker stopped')
  }
})

const start = async () => {
  // Load all domains as services
  await broker.loadServices()
  // Get all aliases for metadata
  const services = broker.services
  let aliases = {
    async 'GET /hc' (req, res) {
      const data = await req.$ctx.broker.call('$node.health')
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.writeHead(200)
      res.end(JSON.stringify(data))
    }
  }
  services.map(service => {
    aliases = { ...aliases, ...service.metadata.aliases }
  })
  // Load API Gateway
  broker.createService({
    mixins: [ApiService],
    settings: {
      path: '/',
      routes: [{
        mappingPolicy: 'restrict',
        mergeParams: true,
        aliases
      }]
    }
  })
  // Start the broker
  await broker.start()
}

start()
