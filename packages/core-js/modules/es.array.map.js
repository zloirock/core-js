'use strict';
var internalMap = require('../internals/array-methods')(1);
var SPECIES = require('../internals/well-known-symbol')('species');

// `Array.prototype.map` method
// https://tc39.github.io/ecma262/#sec-array.prototype.map
// with adding support of @@species
require('../internals/export')({ target: 'Array', proto: true, forced: require('../internals/fails')(function () {
  var array = [];
  var constructor = array.constructor = {};
  constructor[SPECIES] = function () {
    return { foo: 1 };
  };
  return array.map(Boolean).foo !== 1;
}) }, {
  map: function map(callbackfn /* , thisArg */) {
    return internalMap(this, callbackfn, arguments[1]);
  }
});
