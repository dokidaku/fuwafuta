const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    console.log('%s %s [%d, %s ms]',
        ctx.method, ctx.url,
        ctx.status, Date.now() - start);
});

app.use(ctx => {
    ctx.body = 'Hello world!';
});

app.listen(2233);
console.log('Up at http://127.0.0.1:2233/ (/=w=)~');

