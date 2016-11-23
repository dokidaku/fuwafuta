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
    var auth = uuid()
    redis.sadd('auths', auth)
    ctx.cookies.set('auth', auth, { expires: new Date(Date.now() + 1000 * 5) })
  }
  var cookie_auth = ctx.cookies.get('auth')
  if (!cookie_auth) refreshCookies()
  else redis.sismember('auths', cookie_auth).then((is_authorized) => {
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

io.on('connection', (socket) => {
  var auth_id = cookie.parse(socket.handshake.headers.cookie)
  redis.sismember('auths', auth_id.auth).then((is_authorized) => {
    if (!is_authorized) {
      socket.emit('unauthorized')
      socket.disconnect(true)
      return
    }
    socket.auth_id = auth_id.auth
    console.log(`Connected:    ${socket.id} / ${socket.auth_id}`)
    socket.on('disconnect', ((_socket) => () => {
      console.log(`Disconnected: ${_socket.id} / ${_socket.auth_id}`)
    })(socket))
  })
})

app.listen(6033, () => {
  console.log('Up at http://127.0.0.1:6033/ (/=w=)~')
})
