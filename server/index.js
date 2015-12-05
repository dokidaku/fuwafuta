var express = require('express');
var app = express();
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
var passcodeTimer = setInterval(passcode_regen, 15000);

app.use('/static', express.static(__dirname + '/static'));
app.get('/admin', function (req, res) {
    res.sendFile(__dirname + '/static/admin.html');
});

// TODO: Make use of SocketIO's group mechanism
var adminSocket = null;
var comments = [];
// NOTE: Should an array be used to store all the sockets??
// http://stackoverflow.com/q/8467784

io.on('connection', function (socket) {
    socket.isAdmin = false;
    socket.on('disconnect', function () {
        if (socket.isAdmin) {
            console.info('Administrator disconnected!');
            adminSocket = null;
            passcode_regen();
            passcodeTimer = setInterval(passcode_regen, 15000);
        }
    });
    socket.on('verify', function (psw) {
        if (!adminSocket && psw === passcode) {
            console.info('Administrator connected!');
            socket.isAdmin = true;
            adminSocket = socket;
            clearTimeout(passcodeTimer);
        }
        if (socket.isAdmin) {
            socket.emit('verifyResult', 'ok');
        } else {
            socket.emit('verifyResult', 'QwQ');
        }
    });
    socket.on('comment', function (cmt) {
        cmt.id = comments.length;
        socket.emit('commentReceived', cmt);
        cmt.author = socket.id;
        comments.push(cmt);
        adminSocket.emit('comment', cmt);
    });
    socket.on('accept', function (data) {
        if (socket.isAdmin) {
            console.log(comments[data.id]);
            io.sockets.connected[comments[data.id].author].emit('commentAccepted', data);
        }
    });
    socket.on('reject', function (data) {
        if (socket.isAdmin) {
            io.sockets.connected[comments[data.id].author].emit('commentRejected', data);
        }
    });
});

server.listen(25252, function () {
    console.log('Started at http://*:25252/');
});
