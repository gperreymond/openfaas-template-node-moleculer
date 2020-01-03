const axios = require('axios')
const Moleculer = require('../modules/Moleculer')

const moleculer = new Moleculer()

beforeAll(async () => {
  await moleculer.initialize()
  await moleculer.start()
})
afterAll(async () => {
  await moleculer.stop()
  await new Promise(resolve => setTimeout(() => resolve(), 500)) // avoid jest open handle error
})

describe('[Unit] Moleculer', () => {
  test('should successfully get the /hc', async () => {
    const { data } = await axios.get('http://localhost:3000/hc').catch(err => {
      expect(err).toEqual(null)
    })
    const { client: { type } } = data
    expect(type).toEqual('nodejs')
  })
})
