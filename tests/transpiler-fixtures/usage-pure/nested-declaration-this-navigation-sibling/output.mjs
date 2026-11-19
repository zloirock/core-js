var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
var _ref3;
// A leaf default and surviving sibling both read the initializer's original navigation.
// The receiver is this, not the whole constructor-valued initializer.
exports.Array = Array;
const _ref2 = this.Array,
  {
    prototype: _ref
  } = _ref2,
  at = (_ref3 = _atMaybeArray(_ref)) === void 0 ? fallback() : _ref3,
  {
    isArray
  } = _ref2;
exports.result = [at, isArray];