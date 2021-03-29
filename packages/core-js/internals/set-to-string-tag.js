var definePropertyModule = require('../internals/object-define-property');
var has = require('../internals/has');
var wellKnownSymbol = require('../internals/well-known-symbol');

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (it, TAG, STATIC) {
  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
    definePropertyModule.f(it, TO_STRING_TAG, { configurable: true, value: TAG });
  }
};
