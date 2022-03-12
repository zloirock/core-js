var call = require('../internals/function-call');

module.exports = function (it) {
  // eslint-disable-next-line es-x/no-set -- safe
  return call(Set.prototype.values, it);
};
