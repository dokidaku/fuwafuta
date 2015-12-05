var socket = io();

socket.on('commentReceived', function (cmt) {
    $('#text-send-spinner').addClass('invisible');
    $('#draw-send-spinner').addClass('invisible');
    $('#cmt-list').append($('<li>')
        .attr('id', 'cmt-disp-' + cmt.id)
        .text(cmt.text)
        .css('color', cmt.color)
    );
});
socket.on('commentAccepted', function (msg) {
    $('#cmt-disp-' + msg.id).addClass('past-accepted');
});
socket.on('commentRejected', function (msg) {
    $('#cmt-disp-' + msg.id).addClass('past-rejected')
        .append('<br><i class="fa fa-times"></i>&nbsp;' + msg.reason);
});

$(function() {
    $('#sketch').sketch({defaultColor: '#000'});
});

$('#comment-ipt').keypress(function (e) {
    if (e.keyCode === 13) $('#text-send').click();
});
$('#text-send').click(function () {
    $('#text-send-spinner').removeClass('invisible');
    socket.emit('comment', { text: $('#comment-ipt').val(), type: 1, color: [255, 255, 255] });
});
