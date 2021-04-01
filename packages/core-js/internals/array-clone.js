var isArray = require('../internals/is-array');
var slice = require('../internals/array-slice');

module.exports = function (it) {
  if (!isArray(it)) {
    throw TypeError(String(it) + ' is not an array');
  } return slice.call(it);
};
