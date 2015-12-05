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

var sendAccept = function (id) {
    socket.emit('accept', { id: id });
};
var sendReject = function (id, reason) {
    socket.emit('reject', { id: id, reason: reason });
};
var fillRejectInput = function (id, str) {
    $('#comment-ipt-' + id).val(str);
};
var createReasonShortcut = function (obj, id, str) {
    obj.append($('<a>')
        .attr('href', 'javascript:fillRejectInput(' + id + ', "' + str + '");')
        .addClass('reject-reason-shortcut')
        .text(str)
    ).append($('<br>'));
};
var askReject = function (id) {
    $('#reject-a-' + id).addClass('hidden');
    var div = $('<div>')
        .addClass('reject-ask')
        .text('Reason?')
        .append($('<input>').attr('id', 'comment-ipt-' + id)
            .css('width', '100%')
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
        .append($('<i class="fa fa-check"></i>'))
    ).append($('<a>')
        .attr('href', 'javascript:askReject(' + cmt.id + ');')
        .attr('id', 'reject-a-' + cmt.id)
        .addClass('reject-button')
        .append($('<i class="fa fa-close"></i>'))
    );
    $('#console-main').prepend(li);
};

socket.on('comment', function (cmt) {
    if (cmt.text[0] === '#') {
        if (cmt.text[1] === '#') {
            cmt.text = cmt.text.substr(1);
            commentQueuePush(cmt);
        } else {
            // TODO: Handle pictures
        }
    } else {
        commentQueuePush(cmt);
    }
});

socket.on('commentReceived', function (cmt) { console.log('Received', cmt); });
socket.on('commentAccepted', function (cmt) { console.log('Accepted', cmt); });
socket.on('commentRejected', function (cmt) { console.log('Rejected', cmt); });
