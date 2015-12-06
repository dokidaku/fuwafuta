var socket = io();

var commenTypeIcon = function (type) {
    switch (type) {
        case 0: return $('<i class="fa fa-long-arrow-left"></i>&nbsp;');
        case 1: return $('<i class="fa fa-level-up"></i>&nbsp;');
        case 2: return $('<i class="fa fa-level-down"></i>&nbsp;');
        default: return null;
    }
};

socket.on('commentReceived', function (cmt) {
    $('#text-send-spinner').addClass('invisible');
    $('#draw-send-spinner').addClass('invisible');
    var s = null;
    if (cmt.text[0] == '#') {
        if (cmt.text[1] == '#') cmt.text = cmt.text.substr(1);
        else { s = cmt.text.substr(1).split(' '); cmt.text = ''; }
    }
    $('#cmt-list').append($('<li>')
        .attr('id', 'cmt-disp-' + cmt.id)
        .text(cmt.text)
        .css('color', cmt.color)
        .addClass(isDark(cmt.color) ? '' : 'dark')
        .prepend(commenTypeIcon(cmt.type))
    );
    if (s) {
        // TODO: Reduce code duplication
        var canvas = $('<canvas>')
            .attr('id', 'draw-disp-' + cmt.id)
            .attr('width', s[0])
            .attr('height', s[1]);
        $('#cmt-disp-' + cmt.id).prepend(canvas);
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
    }
});
socket.on('commentAccepted', function (msg) {
    $('#cmt-disp-' + msg.id).addClass('past-accepted');
});
socket.on('commentRejected', function (msg) {
    $('#cmt-disp-' + msg.id).addClass('past-rejected')
        .append('<br><i class="fa fa-times"></i>&nbsp;' + msg.reason);
});

$('#btn-toggle-mode').click(function () {
    $('#comment-text').toggleClass('invisible');
    $('#comment-draw').toggleClass('invisible');
    $('#btn-toggle-mode-i1').toggleClass('invisible');
    $('#btn-toggle-mode-i2').toggleClass('invisible');
});

// General comment information
var cmtColor = { r: 0, g: 0, b: 0 };

// Text-related operations
$('#comment-ipt').keypress(function (e) {
    if (e.keyCode === 13) $('#text-send').click();
});
$('#text-send').click(function () {
    if ($('#comment-ipt').val().trim() !== '') {
        $('#text-send-spinner').removeClass('invisible');
        socket.emit('comment', { text: $('#comment-ipt').val(), type: 1, color: cmtColor });
        $('#comment-ipt').val('');
    }
});

// Painting-related operations
var isDark = function (c) {
    if (c instanceof Array) {
        return (c[0] * 0.29 + c[1] * 0.60 + c[2] * 0.11) < 128;
    } else {
        return (c.r * 0.29 + c.g * 0.60 + c.b * 0.11) < 128;
    }
};
var isMouseDown = false;
var canvas = $('#sketch');
var ctx = canvas[0].getContext('2d');
var imgdat = ctx.getImageData(0, 0, canvas[0].width, canvas[0].height);
var setPixel = function (x, y) {
    if (x >= 0 && x < canvas[0].width && y >= 0 && y < canvas[0].height) {
        imgdat.data[x * 4 + y * canvas[0].width * 4] = cmtColor.r;
        imgdat.data[x * 4 + y * canvas[0].width * 4 + 1] = cmtColor.g;
        imgdat.data[x * 4 + y * canvas[0].width * 4 + 2] = cmtColor.b;
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
var clearSketch = function () {
    for (var i = 0; i < imgdat.data.length; i += 4)
        imgdat.data[i] = imgdat.data[i + 1] = imgdat.data[i + 2] = imgdat.data[i + 3] = 0;
    ctx.putImageData(imgdat, 0, 0);
};
var runLenEncode = function () {
    var s = '#' + canvas[0].width + ' ' + canvas[0].height;
    var lastPixel = false, curPixel;
    var counter = 0;
    for (var i = 0; i < imgdat.data.length; i += 4) {
        curPixel = imgdat.data[i + 3] &&
            (imgdat.data[i] != 255 || imgdat.data[i + 1] != 255 || imgdat.data[i + 2] != 255);
        if (curPixel ^ lastPixel) {
            s += ' ' + counter;
            counter = 1;
        } else {
            ++counter;
        }
        lastPixel = curPixel;
    }
    s += ' ' + counter;
    return s;
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
$('#draw-clear').click(function () {
    clearSketch();
});
$('#draw-send').click(function () {
    $('#draw-send-spinner').removeClass('invisible');
    socket.emit('comment', {
        text: runLenEncode(), type: 1,
        color: [cmtColor.r, cmtColor.g, cmtColor.b]
    });
    clearSketch();
});

// Change settings, updating display etc.
$('#color-picker').spectrum({ color: '#000' });
$('#color-picker').change(function () {
    cmtColor = $('#color-picker').spectrum('get').toRgb();
    var bg = (isDark(cmtColor) ? 'transparent' : '#444');
    // Change the colour of the text input
    $('#comment-ipt').css('color', $('#color-picker').spectrum('get').toRgbString());
    $('#comment-ipt').css('background-color', bg);
    // Change the colour of the whole canvas
    for (var i = 0; i < imgdat.data.length; i += 4) {
        if (imgdat.data[i + 3] &&
            (imgdat.data[i] != 255 || imgdat.data[i + 1] != 255 || imgdat.data[i + 2] != 255))
        {
            imgdat.data[i] = cmtColor.r;
            imgdat.data[i + 1] = cmtColor.g;
            imgdat.data[i + 2] = cmtColor.b;
        }
    }
    ctx.putImageData(imgdat, 0, 0);
    canvas.css('background-color', bg);
});
