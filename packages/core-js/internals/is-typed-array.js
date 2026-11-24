'use strict';
var getTypedArrayName = require('../internals/get-typed-array-name');

module.exports = function (it) {
  return !!getTypedArrayName(it);
};
