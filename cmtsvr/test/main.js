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
      assert.strictEqual(await api.loginClient(rand_uid), true)
      assert.strictEqual(await api.loginClient('Orz~ Orz'), true)
      assert.strictEqual(await api.loginClient('YesYes'), true)
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
      assert.strictEqual(await api.logoutClient(rand_uid), true)
      assert.equal(await redis.scard('group:2'), 0)
      assert.deepEqual(await redis.smembers('group:3'), ['YesYes'])
      assert.strictEqual(await api.logoutClient('YesYes'), true)
      assert.equal(await redis.scard('group:2'), 0)
      assert.equal(await redis.scard('group:3'), 0)
    })
    it('should have #logoutAllClients() working', async function () {
      await api.loginClient('YesYes')
      await api.loginClient('Orz~ Orz')
      assert.equal(await redis.scard('group:3'), 2)
      await api.logoutAllClients()
      assert.equal(await redis.scard('group:3'), 0)
    })
    it('should have #loginClient() complain with nonexistent UID and non-strings', async function () {
      assert.strictEqual(await api.loginClient('qwelk'), false)
      assert.strictEqual(await api.loginClient(1317), false)
      assert.strictEqual(await api.loginClient({ message: 'Catch Me If You Can' }), false)
    })
    it('should have #reassignClient() complain with nonexistent UID and non-strings', async function () {
      assert.strictEqual(await api.reassignClient('qwelk', 0), false)
      assert.strictEqual(await api.reassignClient(1317, 0), false)
      assert.strictEqual(await api.reassignClient({ message: 'Catch Me If You Can' }, 0), false)
    })
    it('should have #logoutClient() complain with nonexistent UID and non-strings', async function () {
      assert.strictEqual(await api.logoutClient('qwelk'), false)
      assert.strictEqual(await api.logoutClient(1317), false)
      assert.strictEqual(await api.logoutClient({ message: 'Catch Me If You Can' }), false)
    })
  })
})
