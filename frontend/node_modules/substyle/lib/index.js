"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "PropsDecoratorProvider", {
  enumerable: true,
  get: function get() {
    return _PropsDecoratorProvider.default;
  }
});
Object.defineProperty(exports, "PropsDecoratorContext", {
  enumerable: true,
  get: function get() {
    return _PropsDecoratorProvider.PropsDecoratorContext;
  }
});
Object.defineProperty(exports, "createSubstyle", {
  enumerable: true,
  get: function get() {
    return _createSubstyle.default;
  }
});
Object.defineProperty(exports, "defaultPropsDecorator", {
  enumerable: true,
  get: function get() {
    return _defaultPropsDecorator.default;
  }
});
Object.defineProperty(exports, "inline", {
  enumerable: true,
  get: function get() {
    return _inline.default;
  }
});
exports.default = void 0;

var _PropsDecoratorProvider = _interopRequireWildcard(require("./PropsDecoratorProvider"));

var _createSubstyle = _interopRequireDefault(require("./createSubstyle"));

var _defaultPropsDecorator = _interopRequireDefault(require("./defaultPropsDecorator"));

var _inline = _interopRequireDefault(require("./inline"));

var _useStyles = _interopRequireDefault(require("./useStyles"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var _default = _useStyles.default;
exports.default = _default;