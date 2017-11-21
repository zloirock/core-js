var nativeForEach = [].forEach;
var $forEach = require('./_array-methods')(0);
var STRICT = require('./_strict-method')(nativeForEach, true);

// 22.1.3.10 Array.prototype.forEach(callbackfn [, thisArg])
module.exports = STRICT ? nativeForEach : function forEach(callbackfn /* , thisArg */) {
  return $forEach(this, callbackfn, arguments[1]);
};
