function commentingPlugin (options) {
  var Button = videojs.getComponent('Button');

  this.on('loadeddata', function (e) {
    console.log('Playback started!');
    var fscrCtrl = document.getElementsByClassName('vjs-fullscreen-control')[0];

    var textArea = document.createElement('input');
    textArea.className += ' vjs-cmtinput';
    textArea.setAttribute('placeholder', 'Start commenting here = =');
    textArea.setAttribute('maxlength', '140');
    this.controlBar.addChild(textArea);
    player.controlBar.el().insertBefore(textArea, fscrCtrl);

    var sendBtn = new Button();
    sendBtn.el().className += ' vjs-icon-circle-inner-circle';
    sendBtn.el().setAttribute('title', 'Send');
    sendBtn.on('click', function () { alert('x'); });
    player.controlBar.el().insertBefore(sendBtn.el(), fscrCtrl);

    var cmtToggleBtn = new Button();
    cmtToggleBtn.el().className += ' vjs-icon-subtitles';
    cmtToggleBtn.el().setAttribute('title', 'Comments Display');
    cmtToggleBtn.on('click', function () { alert('x'); });
    player.controlBar.el().insertBefore(cmtToggleBtn.el(), fscrCtrl);
  });
};
