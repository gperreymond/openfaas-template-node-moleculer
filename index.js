const Moleculer = require('./modules/Moleculer')

const start = async () => {
  const moleculer = new Moleculer()
  await moleculer.initialize()
  await moleculer.start()
}

start()
