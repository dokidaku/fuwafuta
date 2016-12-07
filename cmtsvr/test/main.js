const assert = require('assert')
const redis = new require('ioredis')()

const api = require('../main')

redis.flushall(() => run())

describe('API Level', function () {
  describe('User management', function () {
    it('#createClient() should work with random ID', async function () {
      const uid = api.createClient(2)
      assert.equal(await redis.hget('client:' + uid, 'role'), 2)
    })
    it('#createClient() should work with given ID', async function () {
      const uid = api.createClientWithID('Orz~ Orz', 2)
      assert.strictEqual(uid, 'Orz~ Orz')
      assert.equal(await redis.hget('client:' + uid, 'role'), 2)
    })
    it('#reassignClient() should work', async function () {
      const uid = 'Orz~ Orz'
      await api.reassignClient(uid, 3)
      assert.equal(await redis.hget('client:' + uid, 'role'), 3)
    })
  })
})
