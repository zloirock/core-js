'use strict';
var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var getMapIterator = require('../internals/get-map-iterator');
var iterate = require('../internals/iterate');

// `Map.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Map', proto: true, real: true, forced: IS_PURE }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var hasInitialValue = arguments.length > 1;
    var accumulator = hasInitialValue ? arguments[1] : undefined;
    var empty = true;
    aFunction(callbackfn);
    iterate(iterator, function (key, value) {
      if (empty && !hasInitialValue) {
        empty = false;
        accumulator = value;
      } else {
        accumulator = callbackfn(accumulator, value, key, map);
      }
    }, undefined, true, true);
    if (empty && !hasInitialValue) throw TypeError('Reduce of empty map with no initial value');
    return accumulator;
  }
});
