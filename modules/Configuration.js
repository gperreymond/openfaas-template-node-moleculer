const nconf = require('nconf')
nconf.argv().env().file({ file: 'nconf.json' })

// ************************************
// Typecasting from kube env
// ************************************
let APP_MOLECULER_LOGGER = true
let APP_MOLECULER_METRICS = true
let APP_RABBITMQ_PREFETCH = 1
// ************************************
if (nconf.get('APP_MOLECULER_LOGGER')) { APP_MOLECULER_LOGGER = nconf.get('APP_MOLECULER_LOGGER') === 'true' }
if (nconf.get('APP_MOLECULER_METRICS')) { APP_MOLECULER_METRICS = nconf.get('APP_MOLECULER_METRICS') === 'true' }
if (nconf.get('APP_RABBITMQ_PREFETCH')) { APP_RABBITMQ_PREFETCH = parseInt(nconf.get('APP_MOLECULER_METRICS')) }
// ************************************

const APP_RABBITMQ_URI = nconf.get('APP_RABBITMQ_URI') || 'amqp://username:password@localhost:5672'

const APP_MOLECULER_TRANSPORTER = {
  type: 'AMQP',
  options: {
    url: APP_RABBITMQ_URI,
    eventTimeToLive: 5000,
    prefetch: APP_RABBITMQ_PREFETCH,
    autoDeleteQueues: true
  }
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  moleculer: {
    validation: true,
    logger: APP_MOLECULER_LOGGER,
    transporter: (process.env.NODE_ENV !== 'test') ? APP_MOLECULER_TRANSPORTER : null,
    metrics: {
      enabled: APP_MOLECULER_METRICS,
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
    }
  }
}
