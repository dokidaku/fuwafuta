const Koa = require('koa')
const app = new Koa()

const send = require('koa-send')

const Router = require('koa-better-router')
const router = new Router().loadMethods()

const io = require('socket.io')(6034)
var sockets = {}

const Redis = require('ioredis')
const redis = new Redis()

const cookie = require('cookie')
const uuid = require('uuid')

const checkCookies = async (ctx, next) => {
  const refreshCookies = () => {
    var new_uid = uuid()
    redis.hmset('client:' + new_uid, 'created', Date.now(), 'role', 0)
    ctx.cookies.set('auth', new_uid, { expires: new Date(Date.now() + 1000 * 30) })
  }
  var uid = ctx.cookies.get('auth')
  if (!uid) refreshCookies()
  else {
    const is_authorized = await redis.exists('client:' + uid)
    if (!is_authorized) refreshCookies()
  }
  return next()
}

router.get('/', ctx => {
  ctx.redirect('/index.html')
})

router.get('/:html([A-Za-z0-9_-]+\\.html)', checkCookies, async (ctx, next) => {
  await send(ctx, ctx.params.html, { root: __dirname + '/static' })
  next()
})

router.get('/static/:file', async (ctx, next) => {
  await send(ctx, ctx.params.file, { root: __dirname + '/static' })
  next()
})

app.use(router.middleware())

const createComment = async (uid, text, attr) => {
  console.log(`From ${uid}: ${text} / ${attr}`)
  const cid = await redis.incr('cmt_count')
  redis.hmset('cmt:' + cid,
    'owner', uid, 'text', text, 'attr', attr,
    'created', Date.now(), 'votes', 0, 'score', 0
  )
  redis.lpush('cmtby:' + uid, cid)
}

router.get('/my', checkCookies, async (ctx, next) => {
  var uid = ctx.cookies.get('auth')
  const cidlist = await redis.lrange('cmtby:' + uid, 0, 4)
  const results = await redis.multi(cidlist.map((cid) => ['hmget', 'cmt:' + cid, 'text', 'votes', 'score'])).exec()
  if (!results || results.length === 0) ctx.body = 'No items'
  else ctx.body = results.map((c) => `${c[1][0]} (${c[1][2]}/${c[1][1]})`).join('\n')
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
  socket.on('disconnect', ((_socket) => () => {
    console.log(`Disconnected: ${_socket.id} / ${_socket.uid}`)
    sockets[_socket.id] = null
  })(socket))

  socket.on('pop', ((_socket) => (text, attr) => {
    createComment(_socket.uid, text, attr)
  })(socket))
})

app.listen(6033, () => {
  console.log('Up at http://127.0.0.1:6033/ (/=w=)~')
})
