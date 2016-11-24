const Koa = require('koa')
const app = new Koa()

const send = require('koa-send')

const Router = require('koa-better-router')
const router = new Router().loadMethods()

const io = require('socket.io')(6034)
var sockets = {}, sidmap = {}
const role_priv = {
  NOTHING: 0, UNFILTERED: 1, APPROVED: 2, OVERRULED: 4, OWN: 8,
}
const role_cfg = {
  HTML_FREESTYLE: 0, '0': role_priv.UNFILTERED | role_priv.OWN,
  HTML_RESTRAINED: 1, '1': role_priv.APPROVED | role_priv.OWN,
  MODERATOR: 2, '2': role_priv.UNFILTERED,
  DISPLAY: 3, '3': role_priv.APPROVED,
  IMSERVER: 4, '4': role_priv.NOTHING,
  ROLES_CT: 5,
  IGNORANT: 9987, '9987': role_priv.NOTHING
}

const Redis = require('ioredis')
const redis = new Redis()

const cookie = require('cookie')
const uuid = require('uuid')

const createComment = async (uid, text, attr) => {
  // Add to the database
  console.log(`From ${uid}: ${text} / ${attr}`)
  const cid = await redis.incr('cmt_count')
  const transaction = redis.multi()
    .hmset('cmt:' + cid,
      'owner', uid, 'text', text, 'attr', attr,
      'created', Date.now(), 'score', 0)
    .lpush('cmtby:' + uid, cid)
  const jury = await redis.smembers('group:' + role_cfg.MODERATOR)
  if (jury.length != 0) {
    transaction.sadd.apply(transaction, ['cmtjury:' + cid].concat(jury))
  }
  transaction.exec()

  // Notify who may concern
  var notifylist = []
  for (var i = 0; i < role_cfg.ROLES_CT; ++i) if (role_cfg[i] & role_priv.UNFILTERED) {
    notifylist = notifylist.concat(await redis.smembers('group:' + i))
  }
  for (var i = 0; i < notifylist.length; ++i) {
    sockets[sidmap[notifylist[i]]].emit('comment', { state: role_priv.UNFILTERED, text: text, attr: attr })
  }
}

const createClient = () => {
  var new_uid = uuid()
  redis.hmset('client:' + new_uid, 'created', Date.now(), 'role', role_cfg.IGNORANT)
  return new_uid
}

const loginClient = async (uid) => {
  const prev_role = await redis.hget('client:' + uid, 'role')
  redis.sadd('group:' + prev_role, uid)
}

const reassignClient = async (uid, new_role) => {
  const prev_role = await redis.hget('client:' + uid, 'role')
  redis.multi()
    .hset('client:' + uid, 'role', new_role)
    .srem('group:' + prev_role, uid)
    .sadd('group:' + new_role, uid)
    .exec()
}

const logoutClient = async (uid) => {
  const prev_role = await redis.hget('client:' + uid, 'role')
  redis.srem('group:' + prev_role, uid)
}

const logoutAllClients = () => {
  const transaction = redis.multi()
  for (var i = 0; i < role_cfg.ROLES_CT; ++i) transaction.del('group:' + i)
  transaction.exec()
}
logoutAllClients()

const checkCookies = (role) => async (ctx, next) => {
  const refreshCookies = () => {
    var new_uid = createClient()
    ctx.cookies.set('auth', new_uid, { expires: new Date(Date.now() + 1000 * 3600) })
    return new_uid
  }
  var uid = ctx.cookies.get('auth')
  if (!uid) uid = refreshCookies()
  else {
    const is_authorized = await redis.exists('client:' + uid)
    if (!is_authorized) refreshCookies()
  }
  if (typeof role === 'function') role = role(ctx.params.html || '') || role_cfg.IGNORANT
  if (role != role_cfg.IGNORANT) await reassignClient(uid, role)
  return next()
}

router.get('/', ctx => {
  ctx.redirect('/index.html')
})

router.get('/static/:file', async (ctx, next) => {
  await send(ctx, ctx.params.file, { root: __dirname + '/static' })
  next()
})

router.get('/:html([A-Za-z0-9_-]+\\.html)',
  checkCookies((e) => e === 'monitor.html' ? role_cfg.MODERATOR : role_cfg.HTML_FREESTYLE),
  async (ctx, next) => {
    await send(ctx, ctx.params.html, { root: __dirname + '/static' })
    next()
  }
)

router.get('/reassign_1234567/:uid([a-z0-9-]+)/:new_role(\\d+)', async (ctx, next) => {
  await reassignClient(ctx.params.uid, ctx.params.new_role)
  ctx.body = 'Success ♪( ´▽｀)'
  return next()
})

app.use(router.middleware())

router.get('/my', checkCookies(role_cfg.IGNORANT), async (ctx, next) => {
  var uid = ctx.cookies.get('auth')
  const cidlist = await redis.lrange('cmtby:' + uid, 0, 4)
  const ops1 = cidlist.map((cid) => ['hmget', 'cmt:' + cid, 'text', 'score'])
  const ops2 = cidlist.map((cid) => ['scard', 'cmtjury:' + cid])
  const results = await redis.multi(ops1.concat(ops2)).exec()
  if (!results || results.length === 0) ctx.body = 'No items'
  else {
    ctx.body = ''
    for (var i = 0; i < results.length / 2; ++i)
      ctx.body += `${results[i][1][0]} (score ${results[i][1][1]}, pending ${results[i + results.length / 2][1]})\n`
  }
})

io.on('connection', async (socket) => {
  const uid = (cookie.parse(socket.handshake.headers.cookie) || { auth: '' }).auth
  const is_authorized = await redis.exists('client:' + uid)
  if (!is_authorized) {
    socket.emit('unauthorized')
    socket.disconnect(true)
    return
  }

  socket.uid = uid
  console.log(`Connected:    ${socket.id} / ${socket.uid}`)
  sockets[socket.id] = socket
  sidmap[uid] = socket.id
  await loginClient(socket.uid)
  socket.on('disconnect', ((_socket) => async () => {
    console.log(`Disconnected: ${_socket.id} / ${_socket.uid}`)
    sockets[_socket.id] = null
    sidmap[_socket.uid] = null
    await logoutClient(socket.uid)
  })(socket))

  socket.on('pop', ((_socket) => (text, attr) => {
    createComment(_socket.uid, text, attr)
  })(socket))
})

app.listen(6033, () => {
  console.log('Up at http://127.0.0.1:6033/ (/=w=)~')
})
