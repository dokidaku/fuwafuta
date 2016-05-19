const Koa = require('koa');
const app = new Koa();

/*
const redis = require('redis'),
    client = redis.createClient();

const IO = require('koa-socket');
const io = new IO();*/

const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/fuwa');

const Cat = require('./models/cat');
const c = new Cat({ name: 'Nuko' });
c.save(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('NYANPASU-');
    }
});

/*client.set('string__key', 'string value');
client.get('string__key', (err, reply) => { console.log(reply); });
client.hset('hash__key', 'field one', 'value one');
client.hset('hash__key', 'field two', 'value two');
client.hget('hash__key', 'field two', (err, reply) => { console.log(reply); });

io.attach(app);
io.on('connection', (ctx, data) => {
    console.log('Someone connected! Welcome -u-', data);
});
io.on('poke', (ctx, data) => {
    console.log('Giggle.', data);
});

*/

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    console.log('%s %s [%d, %s ms]',
        ctx.method, ctx.url,
        ctx.status, Date.now() - start);
});

app.use(ctx => {
    ctx.body = '<html><body><script src="https://cdn.socket.io/socket.io-1.4.5.js"></script></body></html>';
});

app.listen(2233);
console.log('Up at http://127.0.0.1:2233/ (/=w=)~');

