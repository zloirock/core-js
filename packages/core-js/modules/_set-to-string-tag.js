var def = require('./_object-dp').f;
var has = require('core-js-internals/has');
var TAG = require('core-js-internals/well-known-symbol')('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};
