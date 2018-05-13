var IS_PURE = require('../internals/is-pure');
var getIterator = require('../internals/get-iterator');

module.exports = function (it) {
  // eslint-disable-next-line no-undef
  return IS_PURE ? getIterator(it) : Set.prototype.values.call(it);
};
