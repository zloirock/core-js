var defineProperty = require('../internals/object-define-property').f;
var has = require('../internals/has');
var TO_STRING_TAG = require('../internals/well-known-symbol')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TO_STRING_TAG)) {
    defineProperty(it, TO_STRING_TAG, { configurable: true, value: tag });
  }
};
