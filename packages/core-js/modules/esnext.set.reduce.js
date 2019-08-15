'use strict';
var $ = require('../internals/export');
var IS_PURE = require('../internals/is-pure');
var anObject = require('../internals/an-object');
var aFunction = require('../internals/a-function');
var getSetIterator = require('../internals/get-set-iterator');
var iterate = require('../internals/iterate');

// `Set.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: IS_PURE }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var set = anObject(this);
    var iterator = getSetIterator(set);
    var hasInitialValue = arguments.length > 1;
    var accumulator = hasInitialValue ? arguments[1] : undefined;
    var empty = true;
    aFunction(callbackfn);
    iterate(iterator, function (value) {
      if (empty && !hasInitialValue) {
        empty = false;
        accumulator = value;
      } else {
        accumulator = callbackfn(accumulator, value, value, set);
      }
    }, undefined, false, true);
    if (empty && !hasInitialValue) throw TypeError('Reduce of empty set with no initial value');
    return accumulator;
  }
});
