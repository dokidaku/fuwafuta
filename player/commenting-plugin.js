// Network parts
var createXHR;
if (window.XMLHttpRequest) createXHR = function () { return new XMLHttpRequest(); };
else createXHR = function () { return new ActiveXObject('Microsoft.XMLHTTP'); };

// Plug-in parts

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Component = videojs.getComponent('Component');
var Button = videojs.getComponent('Button');
var Popup = videojs.getComponent('Popup');
var PopupButton = videojs.getComponent('PopupButton');

// Hand-written classes (´Д` )
var ToggleButton = function (_Button) {
  _inherits(ToggleButton, _Button);

  function ToggleButton(player, options) {
    _classCallCheck(this, ToggleButton);
    var _this = _possibleConstructorReturn(this, _Button.call(this, player, options));
    _this.controlText(options && options.controlText || '');
    _this._isOn = false;
    return _this;
  }

  ToggleButton.prototype.buildCSSClass = function buildCSSClass() {
    return 'vjs-menu-object vjs-toggle-btn off ' + _Button.prototype.buildCSSClass.call(this);
  };

  ToggleButton.prototype.manualToggle = function manualToggle() {
    this._isOn = !this._isOn;
    if (this._isOn) {
      this.el_.classList.remove('off'); this.el_.classList.add('on');
    } else {
      this.el_.classList.remove('on'); this.el_.classList.add('off');
    }
  };

  ToggleButton.prototype.handleClick = function handleClick() {
    this.manualToggle();
    this.trigger('toggle', this._isOn);
  };

  return ToggleButton;
}(Button);

var CommentCtrlPanel = function (_Component) {
  _inherits(CommentCtrlPanel, _Component);

  function CommentCtrlPanel(player, options) {
    _classCallCheck(this, CommentCtrlPanel);
    var _this = _possibleConstructorReturn(this, _Component.call(this, player, options));
    return _this;
  }

  CommentCtrlPanel.prototype.createEl = function createEl() {
    var el = _Component.prototype.createEl.call(this, 'div', { className: 'vjs-cmtctrlpanel vjs-control' });

    var grpKara = document.createElement('div');
    var txtKara = document.createElement('div');
    txtKara.classList.add('vjs-menu-object');
    txtKara.textContent = 'Colour';
    grpKara.appendChild(txtKara);
    var iptKara = document.createElement('button');
    iptKara.classList.add('vjs-menu-object');
    var picker = new jscolor(iptKara, {
      container: grpKara, value: "FFFFFF", mode: "HS", position: "left", hash: true,
      width: 120, height: 80, shadow: false, backgroundColor: 'transparent', borderWidth: 0
    });
    this._picker = iptKara;
    grpKara.appendChild(iptKara);
    el.appendChild(grpKara);

    var grpSendAs = document.createElement('div');
    var txtSendAs = document.createElement('div');
    txtSendAs.classList.add('vjs-menu-object');
    txtSendAs.textContent = 'Send As';
    grpSendAs.appendChild(txtSendAs);
    var btnSendAs = new ToggleButton();
    btnSendAs.addClass('vjs-toggle-btn-send');
    btnSendAs.on('toggle', (function (_this) { return function (e, isOn) { _this._sendAsBottom = isOn; }; }(this)));
    this._sendAsBottom = false;
    grpSendAs.appendChild(btnSendAs.el());
    el.appendChild(grpSendAs);

    var grpTop = document.createElement('div');
    var txtTop = document.createElement('div');
    txtTop.classList.add('vjs-menu-object');
    txtTop.textContent = 'Top';
    grpTop.appendChild(txtTop);
    var btnTop = new ToggleButton();
    btnTop.on('toggle', function (e, isOn) {
      console.log('TOP: ' + isOn);
    });
    grpTop.appendChild(btnTop.el());
    el.appendChild(grpTop);

    var grpBottom = document.createElement('div');
    var txtBottom = document.createElement('div');
    txtBottom.classList.add('vjs-menu-object');
    txtBottom.textContent = 'Bottom';
    grpBottom.appendChild(txtBottom);
    var btnBottom = new ToggleButton();
    btnBottom.on('toggle', function (e, isOn) {
      console.log('BTM: ' + isOn);
    });
    grpBottom.appendChild(btnBottom.el());
    el.appendChild(grpBottom);

    var grpFiltration = document.createElement('div');
    var txtFiltration = document.createElement('div');
    txtFiltration.classList.add('vjs-menu-object');
    txtFiltration.textContent = 'Filtration';
    grpFiltration.appendChild(txtFiltration);
    var btnFiltration = new ToggleButton();
    btnFiltration.addClass('vjs-toggle-btn-filtr');
    btnFiltration.on('toggle', function (e, isOn) {
      if (e.target.classList.contains('waiting')) return;
      e.target.classList.add('waiting');
      var xhr = createXHR();
      xhr.onreadystatechange = (function (_target) { return function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
          _target.classList.remove('waiting');
        }
      }; }(e.target))
      xhr.open('POST', '/set_filtration/' + (isOn ? '1' : '0'), true);
      xhr.send();
      console.log('FLT: ' + isOn);
    });
    grpFiltration.appendChild(btnFiltration.el());
    el.appendChild(grpFiltration);
    var xhr = createXHR();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var filState = parseInt(xhr.responseText);
        if (filState == 1) btnFiltration.manualToggle();
      }
    }
    xhr.open('GET', '/get_filtration', true);
    xhr.send();

    return el;
  };

  return CommentCtrlPanel;
}(Component);

var CommentCtrlPopupBtn = function (_PopupButton) {
  _inherits(CommentCtrlPopupBtn, _PopupButton);

  function CommentCtrlPopupBtn(player, options) {
    _classCallCheck(this, CommentCtrlPopupBtn);
    var _this = _possibleConstructorReturn(this, _PopupButton.call(this, player, options));
    return _this;
  }

  CommentCtrlPopupBtn.prototype.createPopup = function () {
    var popup = new Popup(this, { contentElType: 'div' });

    popup.el().style.height = 'auto';
    var b = new CommentCtrlPanel();
    popup.addItem(b);
    this.panel = b;

    return popup;
  };

  CommentCtrlPopupBtn.prototype.buildCSSClass = function () {
    return 'vjs-cmt-popupbtn ' + _PopupButton.prototype.buildCSSClass.call(this);
  };

  return CommentCtrlPopupBtn;
}(PopupButton);

function commentingPlugin (options) {
  this.on('loadeddata', function (e) {
    console.log('Playback started!');
    var fscrCtrl = document.getElementsByClassName('vjs-fullscreen-control')[0];

    var textArea = document.createElement('input');
    textArea.classList.add('vjs-cmtinput');
    textArea.setAttribute('placeholder', 'Start commenting here = =');
    textArea.setAttribute('maxlength', '140');
    this.controlBar.addChild(textArea);
    player.controlBar.el().insertBefore(textArea, fscrCtrl);

    var sendBtn = new Button();
    sendBtn.addClass('vjs-icon-circle-inner-circle');
    sendBtn.el().setAttribute('title', 'Send');
    player.controlBar.el().insertBefore(sendBtn.el(), fscrCtrl);

    var cmtDispBtn = new CommentCtrlPopupBtn(this);
    cmtDispBtn.addClass('vjs-icon-subtitles');
    cmtDispBtn.el().setAttribute('title', 'Comments Settings');
    player.controlBar.el().insertBefore(cmtDispBtn.el(), fscrCtrl);
    
    var menuBtn = document.getElementsByClassName('vjs-cmt-popupbtn')[0];
    var menuEl = menuBtn.childNodes[0];
    menuEl.classList.add('vjs-cmt-menu');
    menuBtn.addEventListener('mouseenter', (function (_menuEl) { return function (e) {
      clearTimeout(_menuEl.timer);
      _menuEl.style.display = 'block';
    }; }(menuEl)));
    menuBtn.addEventListener('mouseleave', (function (_menuEl) { return function (e) {
      clearTimeout(_menuEl.timer);
      _menuEl.timer = setTimeout(function () { _menuEl.style.display = 'none'; _menuEl.timer = null; }, 360);
    }; }(menuEl)));

    sendBtn.on('click', (function (_panel, _textArea) { return function () {
      var style = _panel._picker.textContent + ';' + (_panel._sendAsBottom ? 'b' : 't');
      var text = _textArea.value;
      if (text.trim().length === 0) return;
      _textArea.setAttribute('disabled', '');
      socket.emit('pop', text, style, (function (__textArea) { return function () {
        __textArea.value = '';
        setTimeout(function () { __textArea.removeAttribute('disabled'); }, 5000);
      }; }(_textArea)));
    }; }(cmtDispBtn.panel, textArea)));

    document.getElementsByClassName('vjs-captions-button')[0].style.display = 'none';

    // Overlay
    player.ctel = new ctel({
      width: player.el().offsetWidth, height: player.el().offsetHeight,
      acceptMouseEvents: options.isModerator
    });
    player.addChild({ name: function () { return 'CommentingOverlay'; }, el: function () { return player.ctel.getEl(); } }, 0);
    var videoTechEl = player.el().childNodes[0];
    if (videoTechEl.tagName.toUpperCase() !== 'VIDEO') document.getElementsByTagName('video')[0];
    player.on('mousemove', (function (__targ, __ovl, __el) { return function (e) { if (e.target == __targ) __ovl.handleMouseMove(e.offsetX, e.offsetY); }; }(videoTechEl, player.ctel, player.ctel.getEl())));
    player.on('click', (function (__targ, __ovl, __el) { return function (e) { if (e.target == __targ) __ovl.handleClick(e.offsetX, e.offsetY); }; }(videoTechEl, player.ctel, player.ctel.getEl())));

    // Connecting to socket
    var socket = io();
    socket.on('unauthorized', function () {
      window.location.href = window.location.href;
    });
    socket.on('comment', function (c) {
      // c: id, text, attr("<color>;<t/b>")
      var p = c.attr.lastIndexOf(';');
      var colour = c.attr.substring(0, p), style = c.attr.substring(p + 1);
      if (style === 't') player.ctel.emitTop(c.id, c.text, colour);
      else if (style === 'b') player.ctel.emitBottom(c.id, c.text, colour);
    });
  });
};
