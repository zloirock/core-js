'use strict';
// https://github.com/tc39/proposal-iterator-helpers
var call = require('../internals/function-call');
var map = require('../internals/iterator-map');

var callback = function (value, counter) {
  return [counter, value];
};

module.exports = function indexed() {
  return call(map, this, callback);
};
