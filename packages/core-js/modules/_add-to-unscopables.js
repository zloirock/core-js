// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = require('core-js-internals/well-known-symbol')('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) require('./_hide')(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};
