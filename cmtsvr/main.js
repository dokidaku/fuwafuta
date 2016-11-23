const Koa = require('koa')
const app = new Koa()

const send = require('koa-send')

const Router = require('koa-better-router')
const router = new Router().loadMethods()

const io = require('socket.io')(6034)

const Redis = require('ioredis')
const redis = new Redis()

const cookie = require('cookie')
const uuid = require('uuid')

const checkCookies = (ctx, next) => {
  const refreshCookies = () => {
    var new_uid = uuid()
    redis.hmset('client:' + new_uid, 'created', Date.now(), 'role', 0)
    ctx.cookies.set('auth', new_uid, { expires: new Date(Date.now() + 1000 * 30) })
  }
  var uid = ctx.cookies.get('auth')
  if (!uid) refreshCookies()
  else redis.exists('client:' + uid).then((is_authorized) => {
    if (!is_authorized) refreshCookies()
  })
  return next()
}

router.get('/', ctx => {
  ctx.redirect('/index.html')
})

router.get('/:html([A-Za-z0-9_-]+\\.html)', checkCookies, (ctx, next) => {
  return send(ctx, ctx.params.html, { root: __dirname + '/static' }).then(next)
})

router.get('/static/:file', (ctx, next) => {
  return send(ctx, ctx.params.file, { root: __dirname + '/static' }).then(next)
})

app.use(router.middleware())

const createComment = (uid, text, attr) => {
  console.log(`From ${uid}: ${text} / ${attr}`)
  redis.incr('cmt_count').then((cid) => {
    redis.hmset('cmt:' + cid,
      'owner', uid, 'text', text, 'attr', attr,
      'created', Date.now(), 'votes', 0, 'score', 0
    )
    redis.lpush('cmtby:' + uid, cid)
  })
}

router.get('/my', checkCookies, (ctx, next) => {
  var uid = ctx.cookies.get('auth')
  return redis.lrange('cmtby:' + uid, 0, 4).then((cidlist) => {
    return redis.multi(cidlist.map((cid) => ['hmget', 'cmt:' + cid, 'text', 'votes', 'score'])).exec().then((results) => {
      if (!results || results.length === 0) ctx.body = 'No items'
      else ctx.body = results.map((c) => `${c[1][0]} (${c[1][2]}/${c[1][1]})`).join('\n')
    })
  })
})

io.on('connection', (socket) => {
  var uid = (cookie.parse(socket.handshake.headers.cookie) || { auth: '' }).auth
  redis.exists('client:' + uid).then((is_authorized) => {
    if (!is_authorized) {
      socket.emit('unauthorized')
      socket.disconnect(true)
      return
    }
    socket.uid = uid
    console.log(`Connected:    ${socket.id} / ${socket.uid}`)
    socket.on('disconnect', ((_socket) => () => {
      console.log(`Disconnected: ${_socket.id} / ${_socket.uid}`)
    })(socket))

    socket.on('pop', ((_socket) => (text, attr) => {
      createComment(_socket.uid, text, attr)
    })(socket))
  })
})

app.listen(6033, () => {
  console.log('Up at http://127.0.0.1:6033/ (/=w=)~')
})
