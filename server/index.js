var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var passcode = '';
var hex_random = function () {
    var s = Math.floor(Math.random() * 2147483648).toString(16);
    while (s.length < 8) s = '0' + s;
    return s;
};
var passcode_regen = function () {
    passcode = hex_random() + hex_random() + hex_random() + hex_random();
    console.info('Current passcode: ' + passcode);
};
passcode_regen();
setInterval(passcode_regen, 60000);

app.get('/admin', function (req, res) {
    res.sendFile(__dirname + '/static/admin.html');
});

io.on('connection', function (socket) {
    socket.isAdmin = false;
    socket.on('disconnect', function () {
    });
    socket.on('verify', function (psw) {
        if (socket.isAdmin || psw === passcode) {
            socket.isAdmin = true;
            socket.emit('verifyResult', 'ok');
        } else {
            socket.emit('verifyResult', 'QwQ');
        }
    });
});

server.listen(25252, function () {
    console.log('Started at http://*:25252/');
});
