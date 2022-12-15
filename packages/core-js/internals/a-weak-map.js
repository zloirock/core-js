var has = require('../internals/weak-map-helpers').has;

module.exports = function (it) {
  has(it);
  return it;
};
