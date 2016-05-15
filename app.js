var Koa = require('koa');
var app = new Koa();

app.use(function* (next) {
    var start = Date.now();
    yield next;
    console.log('%s %s - %s', this.method, this.url, Date.now() - start);
});

app.use(function* () {
    this.body = 'Hello world!';
});

app.listen(2233);

