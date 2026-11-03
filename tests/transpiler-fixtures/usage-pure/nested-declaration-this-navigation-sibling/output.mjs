var _atMaybeArray = require("@core-js/pure/actual/array/instance/at");
var _ref;
// A leaf default and surviving sibling both read the initializer's original navigation.
// The receiver is this, not the whole constructor-valued initializer.
exports.Array = Array;
const at = (_ref = _atMaybeArray(this.Array.prototype)) === void 0 ? fallback() : _ref;
const {
  isArray
} = this.Array;
exports.result = [at, isArray];