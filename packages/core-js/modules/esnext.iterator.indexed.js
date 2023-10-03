'use strict';
// TODO: Remove from `core-js@4`
var $ = require('../internals/export');
var call = require('../internals/function-call');
var map = require('../internals/iterator-map');

var callback = function (value, counter) {
  return [counter, value];
};

// `Iterator.prototype.indexed` method
// https://github.com/tc39/proposal-iterator-helpers
$({ target: 'Iterator', proto: true, real: true, forced: true }, {
  indexed: function indexed() {
    return call(map, this, callback);
  }
});
