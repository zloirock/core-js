'use strict';
var getIterator = require('../internals/get-iterator-internal');
var getIteratorDirect = require('../internals/get-iterator-direct');

module.exports = function (argument) {
  return getIteratorDirect(getIterator(argument));
};
