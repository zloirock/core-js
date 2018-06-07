var nativeForEach = [].forEach;
var internalForEach = require('../internals/array-methods')(0);
var STRICT = require('../internals/strict-method')(nativeForEach, true);

// `Array.prototype.forEach` method implementation
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
module.exports = STRICT ? nativeForEach : function forEach(callbackfn /* , thisArg */) {
  return internalForEach(this, callbackfn, arguments[1]);
};
