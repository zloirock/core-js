var nativeForEach = [].forEach;
var internalForEach = require('./_array-methods')(0);
var STRICT = require('./_strict-method')(nativeForEach, true);

// Array.prototype.forEach(callbackfn [, thisArg])
// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
module.exports = STRICT ? nativeForEach : function forEach(callbackfn /* , thisArg */) {
  return internalForEach(this, callbackfn, arguments[1]);
};
