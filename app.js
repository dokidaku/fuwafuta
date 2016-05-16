const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    console.log('%s %s - %s', ctx.method, ctx.url, Date.now() - start);
});

app.use(ctx => {
    ctx.body = 'Hello world!';
});

app.listen(2233);

