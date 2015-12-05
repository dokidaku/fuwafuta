var socket = io();

// TODO: Replace with a form and a <button type='submit'>
$('#ipt-passcode').keypress(function (e) {
    if (e.keyCode === 13) $('#btn-submit').click();
});

$('#btn-submit').click(function () {
    var passcode = $('#ipt-passcode').val();
    $('#message-disp').text('Connecting...');
    socket.emit('verify', passcode);
});

socket.on('verifyResult', function (r) {
    if (r === 'ok') {
        // console.log('Administrator access granted! *\\(^o^)/*');
        $('#subtitle').text('Administration Console').addClass('verified');
        $('#title').addClass('verified');
        $('#psw-enter').addClass('invisible');
        $('#console-main').removeClass('invisible');
    } else {
        // console.log('Not really = =#');
        $('#message-disp').text('Incorrect password (*/ω＼*)');
    }
});

var clearDisplay = function (id, isAccepted) {
    $('#reject-ask-' + id).remove();
    $('#comment-li-' + id).addClass(isAccepted ? 'past-accepted' : 'past-rejected');
    $('#accept-a-' + id).attr('href', 'javascript:;');
    $('#reject-a-' + id).attr('href', 'javascript:;');
    $('#reject-a-' + id).removeClass('invisible');
    if (isAccepted) $('#reject-a-' + id).addClass('hidden');
    else $('#accept-a-' + id).addClass('hidden');
};
var sendAccept = function (id) {
    socket.emit('accept', { id: id });
    clearDisplay(id, true);
};
var sendReject = function (id, reason) {
    socket.emit('reject', { id: id, reason: reason });
    clearDisplay(id, false);
};
var fillRejectInput = function (id, str) {
    $('#comment-ipt-' + id).val(str).focus();
};
var createReasonShortcut = function (obj, id, str) {
    obj.append($('<a>')
        .attr('href', 'javascript:fillRejectInput(' + id + ', "' + str + '");')
        .addClass('reject-reason-shortcut')
        .text(str)
    ).append($('<br>'));
};
var askReject = function (id) {
    $('#reject-a-' + id).addClass('invisible');
    var div = $('<div>')
        .addClass('reject-ask')
        .attr('id', 'reject-ask-' + id)
        .text('Reason?')
        .append($('<input>').attr('id', 'comment-ipt-' + id)
            .css('width', '100%')
            .attr('placeholder', 'Type and press Enter')
            .keypress((function (_id) { return function (e) {
                if (e.keyCode === 13) sendReject(_id, $('#comment-ipt-' + id).val());
            }; })(id))
        );
    createReasonShortcut(div, id, 'Improper language');
    createReasonShortcut(div, id, 'Got it, but not on the screen');
    $('#comment-li-' + id).append(div);
};

var commentQueuePush = function (cmt) {
    var li = $('<li>').text(cmt.text).attr('id', 'comment-li-' + cmt.id);
    li.append($('<a>')
        .attr('href', 'javascript:sendAccept(' + cmt.id + ');')
        .addClass('accept-button')
        .attr('id', 'accept-a-' + cmt.id)
        .append($('<i class="fa fa-check"></i>'))
    ).append($('<a>')
        .attr('href', 'javascript:askReject(' + cmt.id + ');')
        .attr('id', 'reject-a-' + cmt.id)
        .addClass('reject-button')
        .append($('<i class="fa fa-close"></i>'))
    );
    $('#console-main').prepend(li);
};
var commentQueuePushPic = function (cmt) {
    var s = cmt.text.substr(1).split(' ');
    cmt.text = '';
    commentQueuePush(cmt);
    var canvas = $('<canvas>')
        .attr('id', 'draw-disp-' + cmt.id)
        .attr('width', s[0])
        .attr('height', s[1]);
    $('#comment-li-' + cmt.id).prepend(canvas);
    var ctx = canvas[0].getContext('2d');
    var imgdat = ctx.getImageData(0, 0, canvas[0].width, canvas[0].height);
    var i, j = 0, t;
    for (i = 2; i < s.length; ++i) {
        t = j + s[i] * 4;
        if (i % 2 == 1) for (; j < t; j += 4) {
            imgdat.data[j] = cmt.color[0];
            imgdat.data[j + 1] = cmt.color[1];
            imgdat.data[j + 2] = cmt.color[2];
            imgdat.data[j + 3] = 255;
        } else {
            j = t;
        }
    }
    ctx.putImageData(imgdat, 0, 0);
};

socket.on('comment', function (cmt) {
    if (cmt.text[0] === '#') {
        if (cmt.text[1] === '#') {
            cmt.text = cmt.text.substr(1);
            commentQueuePush(cmt);
        } else {
            // TODO: Handle pictures
            commentQueuePushPic(cmt);
        }
    } else {
        commentQueuePush(cmt);
    }
});

socket.on('commentReceived', function (cmt) { console.log('Received', cmt); });
socket.on('commentAccepted', function (cmt) { console.log('Accepted', cmt); });
socket.on('commentRejected', function (cmt) { console.log('Rejected', cmt); });
