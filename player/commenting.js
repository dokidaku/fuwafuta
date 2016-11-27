function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Component = videojs.getComponent('Component');
var Button = videojs.getComponent('Button');
var Popup = videojs.getComponent('Popup');
var PopupButton = videojs.getComponent('PopupButton');

var CommentCtrlPanel = function (_Component) {
  _inherits(CommentCtrlPanel, _Component);

  function CommentCtrlPanel(player, options) {
    _classCallCheck(this, CommentCtrlPanel);
    var _this = _possibleConstructorReturn(this, _Component.call(this, player, options));
    return _this;
  }

  CommentCtrlPanel.prototype.createEl = function createEl() {
    var el = _Component.prototype.createEl.call(this, 'div', { className: 'vjs-cmtctrlpanel vjs-control' });

    var grpTop = document.createElement('div');
    var txtTop = document.createElement('div');
    txtTop.className += ' vjs-menu-object';
    txtTop.textContent = 'Top';
    grpTop.appendChild(txtTop);
    var btnTop = new Button();
    btnTop.el().className += ' vjs-menu-object vjs-toggle-btn on';
    grpTop.appendChild(btnTop.el());
    el.appendChild(grpTop);
    
    var grpBottom = document.createElement('div');
    var txtBottom = document.createElement('div');
    txtBottom.className += ' vjs-menu-object';
    txtBottom.textContent = 'Bottom';
    grpBottom.appendChild(txtBottom);
    var btnBottom = new Button();
    btnBottom.el().className += ' vjs-menu-object vjs-toggle-btn off';
    grpBottom.appendChild(btnBottom.el());
    el.appendChild(grpBottom);
    
    var grpFiltration = document.createElement('div');
    var txtFiltration = document.createElement('div');
    txtFiltration.className += ' vjs-menu-object';
    txtFiltration.textContent = 'Filtration';
    grpFiltration.appendChild(txtFiltration);
    var btnFiltration = new Button();
    btnFiltration.el().className += ' vjs-menu-object vjs-toggle-btn vjs-toggle-btn-filtr on';
    grpFiltration.appendChild(btnFiltration.el());
    el.appendChild(grpFiltration);

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

    return popup;
  };

  return CommentCtrlPopupBtn;
}(PopupButton);

function commentingPlugin (options) {
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
    sendBtn.addClass('vjs-icon-circle-inner-circle');
    sendBtn.el().setAttribute('title', 'Send');
    sendBtn.on('click', function () { alert('x'); });
    player.controlBar.el().insertBefore(sendBtn.el(), fscrCtrl);

    var cmtDispBtn = new CommentCtrlPopupBtn(this);
    cmtDispBtn.addClass('vjs-icon-subtitles');
    cmtDispBtn.el().setAttribute('title', 'Comments Display');
    player.controlBar.el().insertBefore(cmtDispBtn.el(), fscrCtrl);
  });
};
