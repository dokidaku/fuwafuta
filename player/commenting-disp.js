(function (window) {
  var ctel = function (opt) {
    if (!(this instanceof ctel)) return new ctel(opt);
    opt = opt || {};
    opt.lineHeight = opt.lineHeight || 28;
    opt.width = opt.width || window.innerWidth || 1080;
    opt.height = opt.height || window.innerHeight || 720;
    opt.removeCallback = opt.removeCallback || undefined;
    this.opt = opt;
    this._rowTSpareR = [];
    this._rowTSpareL = [];
    this._rowBSpare = [];
    this._bulletsT = [];
    this._bulletsB = [];
    this.sayHello();
    this.initEl();
  };

  ctel.prototype.sayHello = function () {
    console.log('Hello from Cuddly Telegram');
  };

  ctel.prototype.initEl = function () {
    this._el = window.document.createElement('div');
    this._el.style.position = 'absolute';
    this._el.style.left = '0px';
    this._el.style.top = '0px';
    this._el.style.pointerEvents = 'none';
    this._el.style.background = 'none';
    this._el.style.overflow = 'hidden';
    this.updateSize();
  };

  ctel.prototype.getEl = function () { return this._el; };

  ctel.prototype.updateSize = function (w, h) {
    this.opt.width = w || this.opt.width;
    this.opt.height = h || this.opt.height;
    this._el.style.width = this.opt.width.toString() + 'px';
    this._el.style.height = this.opt.height.toString() + 'px';
    var cur_rows = Math.floor(this.opt.height / this.opt.lineHeight);
    while (this._rowTSpareR.length < cur_rows) this._rowTSpareR.push(-1);
    while (this._rowTSpareL.length < cur_rows) this._rowTSpareL.push(-1);
    while (this._rowBSpare.length < cur_rows) this._rowBSpare.push(-1);
    while (this._rowTSpareR.length > cur_rows) this._rowTSpareR.pop();
    while (this._rowTSpareL.length > cur_rows) this._rowTSpareL.pop();
    while (this._rowBSpare.length > cur_rows) this._rowBSpare.pop();
  };

  ctel.prototype.createBullet = function (text, colour) {
    var el = window.document.createElement('div');
    this._el.appendChild(el);
    el.style.fontSize = '24px';
    el.style.color = colour || 'white';
    el.style.width = 'auto';
    el.style.whiteSpace = 'nowrap'; // for handling whitespaces; see http://stackoverflow.com/questions/118241/
    el.textContent = text;
    el.style.position = 'absolute';
    el.style.pointerEvents = 'none';
    return el;
  };

  ctel.prototype.emitTop = function (text, colour) {
    var el = this.createBullet(text, colour);
    // Abstractions
    var now = Date.now();
    var x = this.opt.width;
    var d = this.opt.width + el.clientWidth;
    var t = 10000;
    var v = d / t;
    var unblockR = now + el.clientWidth / v;
    var touchL = now + x / v;
    var unblockL = now + t;
    var rowIdx = -1;
    for (var i = 0; i < this._rowTSpareL.length; ++i) {
      if (this._rowTSpareR[i] < now && this._rowTSpareL[i] < touchL) { rowIdx = i; break; }
    }
    if (rowIdx == -1) {
      rowIdx = 0;
      for (var i = 1; i < this._rowTSpareL.length; ++i) {
        if (this._rowTSpareL[i] < this._rowTSpareL[rowIdx]) rowIdx = i;
      }
    }
    this._rowTSpareR[rowIdx] = unblockR;
    this._rowTSpareL[rowIdx] = unblockL;
    // Styles
    el.style.transition = 'left ' + Math.round(t / 1000).toString() + 's linear';
    el.style.left = Math.round(x).toString() + 'px';
    el.style.top = Math.round(rowIdx * this.opt.lineHeight).toString() + 'px';
    el._arrId = this._bulletsT.push(el) - 1;
    setTimeout((function (_el, _x) { return function () {
      _el.style.left = _x.toString() + 'px';
    }; }(el, -el.clientWidth)), 25);
    var transitionEndCallback = (function (_this) { return function (e) {
      _this._bulletsT[e.target._arrId] = _this._bulletsT[_this._bulletsT.length - 1];
      _this._bulletsT[e.target._arrId]._arrId = e.target._arrId;
      _this._bulletsT.pop();
      e.target.parentNode.removeChild(e.target);
    }; }(this));
    el.addEventListener('transitionend', transitionEndCallback);
    el.addEventListener('webkitTransitionend', transitionEndCallback);
  };

  ctel.prototype.emitBottom = function (text, colour) {
    var el = this.createBullet(text, colour);
    // Abstractions
    var now = Date.now();
    var x = (this.opt.width - el.clientWidth) / 2;
    var t = 2000;
    var unblock = now + t;
    var rowIdx = -1;
    for (var i = 0; i < this._rowBSpare.length; ++i) {
      if (this._rowBSpare[i] < now) { rowIdx = i; break; }
    }
    if (rowIdx == -1) {
      rowIdx = 0;
      for (var i = 1; i < this._rowBSpare.length; ++i) {
        if (this._rowBSpare[i] < this._rowBSpare[rowIdx]) rowIdx = i;
      }
    }
    this._rowBSpare[rowIdx] = unblock;
    // Styles
    el.style.left = Math.round(x).toString() + 'px';
    el.style.top = Math.round(this.opt.height - (rowIdx + 1) * this.opt.lineHeight).toString() + 'px';
    el._arrId = this._bulletsB.push(el) - 1;
    setTimeout((function (_this, _el) { return function () {
      _this._bulletsB[_el._arrId] = _this._bulletsB[_this._bulletsB.length - 1];
      _this._bulletsB[_el._arrId]._arrId = _el._arrId;
      _this._bulletsB.pop();
      _el.parentNode.removeChild(_el);
    }; }(this, el)), t);
  };

  window.ctel = ctel;
}(window));
