// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = require('core-js-internals/has');
var toObject = require('core-js-internals/to-object');
var IE_PROTO = require('core-js-internals/shared-key')('IE_PROTO');
var ObjectPrototype = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectPrototype : null;
};
