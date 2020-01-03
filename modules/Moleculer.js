const { ServiceBroker } = require('moleculer')
const ApiService = require('moleculer-web')

const Configuration = require('./Configuration')

class Moleculer {
  constructor () {
    this._instance = new ServiceBroker({
      ...Configuration.moleculer,
      async started (broker) {
        broker.logger.warn('Broker started')
      },
      stopped: async (broker) => {
        broker.logger.warn('Broker stopped')
      }
    })
  }

  getInstance () {
    return this._instance
  }

  async initialize () {
    const broker = this.getInstance()
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
  }

  async start () {
    const broker = this.getInstance()
    await broker.start()
  }

  async stop () {
    const broker = this.getInstance()
    await broker.stop()
  }
}

module.exports = Moleculer
