"use strict";
/**
 * Calling methods on the nidget will treat shadow contents as regular contents.
 */

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _wrapNativeSuper2 = _interopRequireDefault(require("@babel/runtime/helpers/wrapNativeSuper"));

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = (0, _getPrototypeOf2["default"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = (0, _getPrototypeOf2["default"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return (0, _possibleConstructorReturn2["default"])(this, result); }; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

var NidgetElement = /*#__PURE__*/function (_HTMLElement) {
  (0, _inherits2["default"])(NidgetElement, _HTMLElement);

  var _super = _createSuper(NidgetElement);

  function NidgetElement(templateId) {
    var _this;

    (0, _classCallCheck2["default"])(this, NidgetElement);
    _this = _super.call(this);
    if (templateId) _this.applyTemplate(templateId);
    return _this;
  }
  /**
   connectedCallback is invoked each time the custom element is appended into a document-connected element
   */


  (0, _createClass2["default"])(NidgetElement, [{
    key: "connectedCallback",
    value: function () {
      var _connectedCallback = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                this.detectDOM();
                _context.next = 3;
                return this.ready();

              case 3:
                if (!this.classList.contains("hidden")) this.classList.add("visible");

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function connectedCallback() {
        return _connectedCallback.apply(this, arguments);
      }

      return connectedCallback;
    }()
    /**
     * Move elements from the parent element into the template element.
     * @param {string} outer_target query selector for elements to move.
     * @param {string} inner_target query selector for element to move outer targets into.
     * @returns {*} all elements moved
     */

  }, {
    key: "internalize",
    value: function internalize(outer_target) {
      var inner_target = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "#inner";
      var outer_selection = this.outerSelectorAll(outer_target);

      var _iterator = _createForOfIteratorHelper(outer_selection),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var item = _step.value;
          item.detach();
          this.querySelector(inner_target).append(item);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return outer_selection;
    }
  }, {
    key: "detectDOM",
    value: function detectDOM() {
      this.DOM = {};

      var _iterator2 = _createForOfIteratorHelper(this.querySelectorAll("[id]")),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var element = _step2.value;
          this.DOM[toCamelCase(element.id)] = element;
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
    /**
     * Retrieve a map of all data attributes
     * @returns {Map<any, any>}
     */

  }, {
    key: "dataAttributes",
    value: function dataAttributes() {
      var map = new Map();

      var _iterator3 = _createForOfIteratorHelper(this.attributes),
          _step3;

      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var attr = _step3.value;

          if (attr.name.startsWith("data-")) {
            var name = attr.name.substr(5);
            map[name] = attr.value;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }

      return map;
    }
    /**
     * Attach a shadow element with the contents of the template named (templateID).
     * @return {undefined}
     */

  }, {
    key: "applyTemplate",
    value: function () {
      var _applyTemplate = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(templateId) {
        var template;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(this.shadowRoot !== null)) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return");

              case 2:
                template = document.getElementById(templateId);

                if (template) {
                  _context2.next = 5;
                  break;
                }

                throw new Error("Template '" + templateId + "' not found\n" + "Has the .ejs directive been added to the source file?\n" + "<%- include('../partials/nidget-templates'); %>");

              case 5:
                if (!(template.tagName.toUpperCase() !== "TEMPLATE")) {
                  _context2.next = 7;
                  break;
                }

                throw new Error("Element with id '" + templateId + "' is not a template.");

              case 7:
                this.attachShadow({
                  mode: "open"
                }).appendChild(template.content.cloneNode(true));

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function applyTemplate(_x) {
        return _applyTemplate.apply(this, arguments);
      }

      return applyTemplate;
    }()
  }, {
    key: "ready",
    value: function () {
      var _ready = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
        return _regenerator["default"].wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function ready() {
        return _ready.apply(this, arguments);
      }

      return ready;
    }()
  }, {
    key: "visible",
    get: function get() {
      var v = this.classList.contains("visible") === true;
      var h = this.classList.contains("hidden") === true;
      if (v && !h) return true;
      if (h && !v) return false;
      return undefined;
    },
    set: function set(value) {
      if (value) this.show();else this.hide();
    }
    /**
     * Remove 'hidden' class.
     */

  }, {
    key: "show",
    value: function show() {
      this.classList.remove("hidden");
      this.classList.add("visible");
    }
    /**
     * Add 'hidden' class.
     */

  }, {
    key: "hide",
    value: function hide() {
      this.classList.remove("visible");
      this.classList.add("hidden");
    }
    /**
     * Set the disabled flag that is read by nidget mouse functions.
     * @param value
     */

  }, {
    key: "disabled",
    get:
    /**
     * Get the disabled flag that is read by nidget mouse functions.
     * @param value
     */
    function get() {
      if (!this.hasAttribute(NidgetElement.DISABLED_ATTRIBUTE)) return false;
      return this.getAttribute(NidgetElement.DISABLED_ATTRIBUTE);
    }
    /**
     * Return true if this element was under the mouse for the event.
     * @param {type} event
     * @param {type} element
     * @return {Boolean}
     */
    ,
    set: function set(value) {
      this.setAttribute(NidgetElement.DISABLED_ATTRIBUTE, value);
    }
  }, {
    key: "isUnderMouse",
    value: function isUnderMouse(event) {
      var x = event.clientX;
      var y = event.clientY;
      var current = document.elementFromPoint(x, y);

      while (current) {
        if (current === this) return true;
        current = current.parentElement;
      }

      return false;
    }
    /**
     * Perform a query selection on the element, not the shadow root.
     */

  }, {
    key: "outerSelector",
    value: function outerSelector(selectors) {
      return (0, _get2["default"])((0, _getPrototypeOf2["default"])(NidgetElement.prototype), "querySelector", this).call(this, selectors);
    }
    /**
     * Perform a query select all on the element, not the shadow root.
     */

  }, {
    key: "outerSelectorAll",
    value: function outerSelectorAll(selectors) {
      return (0, _get2["default"])((0, _getPrototypeOf2["default"])(NidgetElement.prototype), "querySelectorAll", this).call(this, selectors);
    }
    /**
     * Run the query selector on this element.
     * If this element has a shadow, run it on that instead.
     * @param selectors
     * @returns {HTMLElementTagNameMap[K]}
     */

  }, {
    key: "querySelector",
    value: function querySelector(selectors) {
      if (this.shadowRoot) {
        return this.shadowRoot.querySelector(selectors);
      } else {
        return (0, _get2["default"])((0, _getPrototypeOf2["default"])(NidgetElement.prototype), "querySelector", this).call(this, selectors);
      }
    }
    /**
     * Run the query selector on this element.
     * If this element has a shadow, run it on that instead.
     * @param selectors
     * @returns {HTMLElementTagNameMap[K]}
     */

  }, {
    key: "querySelectorAll",
    value: function querySelectorAll(selectors) {
      if (this.shadowRoot) {
        return this.shadowRoot.querySelectorAll(selectors);
      } else {
        return (0, _get2["default"])((0, _getPrototypeOf2["default"])(NidgetElement.prototype), "querySelectorAll", this).call(this, selectors);
      }
    }
    /**
     * Remove this element from it's parent.
     */

  }, {
    key: "detach",
    value: function detach() {
      return this.parentNode.removeChild(this);
    }
    /**
     * Index within the parent element.
     */

  }, {
    key: "index",
    value: function index() {
      return Array.from(this.parentElement.children).indexOf(this);
    }
  }, {
    key: "closestParent",
    value: function closestParent(selector) {
      var el = this;

      while (el && el !== document && el !== window) {
        var found = el.closest(selector);
        if (found) return found;
        el = el.getRootNode().host;
      }
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent(event_name) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options = _objectSpread(_objectSpread({}, {
        composed: true,
        bubbles: true
      }), {}, {
        options: options
      });
      if (typeof event_name === "string") (0, _get2["default"])((0, _getPrototypeOf2["default"])(NidgetElement.prototype), "dispatchEvent", this).call(this, new CustomEvent(event_name, options));else (0, _get2["default"])((0, _getPrototypeOf2["default"])(NidgetElement.prototype), "dispatchEvent", this).call(this, event_name);
    }
  }]);
  return NidgetElement;
}( /*#__PURE__*/(0, _wrapNativeSuper2["default"])(HTMLElement));
/**
 *
 * @param input
 * @returns {*}
 */


function toCamelCase(input) {
  var split = input.split("-");

  for (var i = 1; i < split.length; i++) {
    split[i] = split[i].charAt(0).toUpperCase() + split[i].slice(1);
  }

  return split.join("");
}

NidgetElement.DISABLED_ATTRIBUTE = "nidget-disabled";

if (!window.customElements.get("nidget-element")) {
  window.customElements.define("nidget-element", NidgetElement);
}

var _default = NidgetElement;
exports["default"] = _default;
