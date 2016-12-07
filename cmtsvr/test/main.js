const assert = require('assert')
const redis = new require('ioredis')()

const api = require('../main')

redis.flushall(() => run())

describe('API Level', function () {
  describe('User management', function () {
    var rand_uid = ''
    it('should have #createClient() working with random ID', async function () {
      const uid = api.createClient(2)
      rand_uid = uid
      assert.equal(await redis.hget('client:' + uid, 'role'), 2)
    })
    it('should have #createClient() working with given ID', async function () {
      const uid = api.createClientWithID('Orz~ Orz', 2)
      assert.strictEqual(uid, 'Orz~ Orz')
      assert.equal(await redis.hget('client:' + uid, 'role'), 2)
      api.createClientWithID('YesYes', 3)
      assert.equal(await redis.hget('client:' + 'YesYes', 'role'), 3)
    })
    it('should have #createClient() complain with non-printable characters', function () {
      assert.strictEqual(api.createClientWithID('\x20\x20\x08\x7f\x81\x20\xa0', 1), null)
    })
    it('should have #createClient() complain with empty strings and non-strings', async function () {
      assert.strictEqual(api.createClientWithID('', 1), null)
      assert.strictEqual(api.createClientWithID(998244353, 2), null)
      assert.strictEqual(api.createClientWithID({ message: 'nyan' }, 3), null)
      assert.equal(await redis.exists('client:'), 0)
    })
    it('should have lists `group:<role>` created by #loginClient()', async function () {
      await api.loginClient(rand_uid)
      await api.loginClient('Orz~ Orz')
      await api.loginClient('YesYes')
      assert.equal(await redis.scard('group:2'), 2)
      assert.equal(await redis.scard('group:3'), 1)
    })
    it('should have #reassignClient() working', async function () {
      const uid = 'Orz~ Orz'
      await api.reassignClient(uid, 3)
      assert.equal(await redis.hget('client:' + uid, 'role'), 3)
    })
    it('should have lists `group:<role>` correctly updated by #reassignClient()', async function () {
      assert.deepEqual(await redis.smembers('group:2'), [rand_uid])
      assert.deepEqual((await redis.smembers('group:3')).sort(), ['Orz~ Orz', 'YesYes'].sort())
    })
    it('should have lists `group:<role>` correctly updated by #logoutClient()', async function () {
      await api.logoutClient('Orz~ Orz')
      assert.deepEqual(await redis.smembers('group:2'), [rand_uid])
      assert.deepEqual(await redis.smembers('group:3'), ['YesYes'])
      await api.logoutClient(rand_uid)
      assert.equal(await redis.scard('group:2'), 0)
      assert.deepEqual(await redis.smembers('group:3'), ['YesYes'])
      await api.logoutClient('YesYes')
      assert.equal(await redis.scard('group:2'), 0)
      assert.equal(await redis.scard('group:3'), 0)
    })
  })
})
