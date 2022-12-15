var has = require('../internals/weak-set-helpers').has;

module.exports = function (it) {
  has(it);
  return it;
};
