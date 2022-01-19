"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _NidgetElement2 = _interopRequireDefault(require("./NidgetElement.js"));

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

/**
 * Set the font-size as a multiple of the css variable --fit-text-unit.
 * Style example: calc(45 * var(--fit-text-unit))
 */
var FitText = /*#__PURE__*/function () {
  function FitText(nidget) {
    (0, _classCallCheck2["default"])(this, FitText);
    this.nidget = nidget;
    this.parseArguments();
    this.coefficient = this.extractUnits();
    this.lastCoefficient = 0;
    this.last = {
      hDiff: this.nidget.parentElement.offsetHeight - this.nidget.scrollHeight,
      wDiff: this.nidget.parentElement.offsetWidth - this.nidget.scrollWidth
    };
  }

  (0, _createClass2["default"])(FitText, [{
    key: "extractUnits",
    value: function extractUnits() {
      var fontSize = this.nidget.style.fontSize;
      if (fontSize === "") return 1;
      if (!fontSize.endsWith(" * var(--fit-text-unit))")) return 1;
      if (!fontSize.startsWith("calc(")) return 1;
      var value = parseInt(fontSize.substr("calc(".length));
      if (!value || value < 1) return 1;
      return value;
    }
  }, {
    key: "notify",
    value: function notify(cb) {
      var _this = this;

      this.direction = 0;
      setImmediate(function () {
        return _this.onResize(cb);
      });
    }
    /**
     * Retrieve the settings from css
     */

  }, {
    key: "parseArguments",
    value: function parseArguments() {
      var args = getComputedStyle(this.nidget).getPropertyValue("--nidget-fit-text");

      if (!args || args === false) {
        this.hValue = 1;
        this.wValue = 1;
        return;
      }

      if (typeof args == "string") {
        if (args.search("height") !== -1) this.hValue = 1;
        if (args.search("width") !== -1) this.wValue = 1;
      }
    }
    /**
     * Fit the text element to it's parent element.
     * @param hValue true, fit the height
     * @param wValue true, fit the width
     */

  }, {
    key: "onResize",
    value: function onResize(cb) {
      var _cb,
          _this2 = this;

      delete this.timeout;
      cb = (_cb = cb) !== null && _cb !== void 0 ? _cb : function () {};
      if (this.nidget.textContent === "") return;
      if (this.nidget.parentElement.offsetHeight === 0) return;
      if (this.nidget.parentElement.offsetWidth === 0) return;
      if (this.nidget.style.display === "none") return;
      if (!this.hValue && !this.wValue) return; // hDiff growth direction due to height
      // wDiff growth direction due to width

      var hDiff = this.nidget.parentElement.offsetHeight - this.nidget.scrollHeight;
      var wDiff = this.nidget.parentElement.offsetWidth - this.nidget.scrollWidth;

      if (this.last.hDiff === hDiff && this.last.wDiff === wDiff) {
        cb(this.nidget.style.fontSize);
        return;
      }

      if (!this.hValue) hDiff = 0;
      if (!this.wValue) wDiff = 0;
      var dir = Math.sign(hDiff | wDiff); // will prefer to shrink

      var newCoefficient = this.coefficient + dir;
      var fontSize = "calc(".concat(newCoefficient, " * var(--fit-text-unit))");

      if (newCoefficient !== this.coefficient && newCoefficient !== this.lastCoefficient) {
        this.nidget.style.opacity = 0.0;
        this.nidget.style.fontSize = fontSize;
        this.lastCoefficient = this.coefficient;
        this.coefficient = newCoefficient;
        this.timeout = setImmediate(function () {
          return _this2.onResize(cb);
        });
      } else {
        this.nidget.style.opacity = 1.0;
        this.lastCoefficient = 0;
        this.last = {
          hDiff: hDiff,
          wDiff: wDiff
        };
        cb(fontSize);
      }
    }
  }]);
  return FitText;
}();
/**
 * A nidget element for displaying text.
 * put '--nidget-fit-text: 1.0;' into css for this element to enable scaling.
 * see: NidgetStyle.js
 */


var NidgetText = /*#__PURE__*/function (_NidgetElement) {
  (0, _inherits2["default"])(NidgetText, _NidgetElement);

  var _super = _createSuper(NidgetText);

  function NidgetText() {
    (0, _classCallCheck2["default"])(this, NidgetText);
    return _super.call(this);
  }

  (0, _createClass2["default"])(NidgetText, [{
    key: "remove",
    value: function remove() {
      (0, _get2["default"])((0, _getPrototypeOf2["default"])(NidgetText.prototype), "remove", this).call(this);
    }
  }, {
    key: "fitText",
    get: function get() {
      if (!this._fitText) this._fitText = new FitText(this);
      return this._fitText;
    }
  }, {
    key: "connectedCallback",
    value: function connectedCallback() {
      (0, _get2["default"])((0, _getPrototypeOf2["default"])(NidgetText.prototype), "connectedCallback", this).call(this);
    }
  }, {
    key: "text",
    get: function get() {
      return this.innerText;
    },
    set: function set(value) {
      this.innerText = value;
    }
  }]);
  return NidgetText;
}(_NidgetElement2["default"]);

;

if (!window.customElements.get('nidget-text')) {
  window.customElements.define('nidget-text', NidgetText);
}

var _default = NidgetText;
exports["default"] = _default;
