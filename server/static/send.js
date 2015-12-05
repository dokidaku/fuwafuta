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

$('#comment-ipt').keypress(function (e) {
    if (e.keyCode === 13) $('#text-send').click();
});
$('#text-send').click(function () {
    $('#text-send-spinner').removeClass('invisible');
    socket.emit('comment', { text: $('#comment-ipt').val(), type: 1, color: [255, 255, 255] });
});

var isMouseDown = false;
var markerColor = { r: 0, g: 0, b: 0 };
var canvas = $('#sketch');
var ctx = canvas[0].getContext('2d');
var imgdat = ctx.getImageData(0, 0, canvas[0].width, canvas[0].height);
var setPixel = function (x, y) {
    if (x >= 0 && x < canvas[0].width && y >= 0 && y < canvas[0].height) {
        imgdat.data[x * 4 + y * canvas[0].width * 4] = markerColor.r;
        imgdat.data[x * 4 + y * canvas[0].width * 4 + 1] = markerColor.g;
        imgdat.data[x * 4 + y * canvas[0].width * 4 + 2] = markerColor.b;
        imgdat.data[x * 4 + y * canvas[0].width * 4 + 3] = 255;
    }
};
var drawDot = function (x, y) {
    var i, j, t;
    for (i = -markerRadius; i <= markerRadius; ++i) {
        t = Math.round(Math.sqrt(markerRadius * markerRadius - i * i));
        for (j = -t; j <= t; ++j) setPixel(x + i, y + j);
    }
};
var markerRadius = 3;
var lastX = -1, lastY = -1;
$('#sketch').mousedown(function () { isMouseDown = true; lastY = -1; });
$('#sketch').mouseup(function () { isMouseDown = false; });
$('#sketch').mousemove(function (e) {
    if (isMouseDown) {
        drawDot(e.offsetX, e.offsetY);
        if (lastY != -1) {
            for (var i = 0; i < 4; ++i)
                drawDot(Math.round(lastX * ((4 - i) / 4) + e.offsetX * (i / 4)),
                    Math.round(lastY * ((4 - i) / 4) + e.offsetY * (i / 4)));
        }
        lastX = e.offsetX;
        lastY = e.offsetY;
        ctx.putImageData(imgdat, 0, 0);
    }
});
$('#draw-cpicker').spectrum({ color: '#000' });
$('#draw-cpicker').change(function () {
    markerColor = $('#draw-cpicker').spectrum('get').toRgb();
    // Change the colour of the whole canvas
    for (var i = 0; i < imgdat.data.length; i += 4) {
        if (imgdat.data[i + 3] &&
            (imgdat.data[i] != 255 || imgdat.data[i + 1] != 255 || imgdat.data[i + 2] != 255))
        {
            imgdat.data[i] = markerColor.r;
            imgdat.data[i + 1] = markerColor.g;
            imgdat.data[i + 2] = markerColor.b;
        }
    }
    ctx.putImageData(imgdat, 0, 0);
});
$('#draw-clear').click(function () {
    for (var i = 0; i < imgdat.data.length; i += 4)
        imgdat.data[i] = imgdat.data[i + 1] = imgdat.data[i + 2] = imgdat.data[i + 3] = 0;
    ctx.putImageData(imgdat, 0, 0);
});
