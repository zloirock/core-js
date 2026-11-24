'use strict';
var getTypedArrayName = require('../internals/get-typed-array-name');

module.exports = function (it) {
  var name = getTypedArrayName(it);
  return name === 'BigInt64Array' || name === 'BigUint64Array';
};
