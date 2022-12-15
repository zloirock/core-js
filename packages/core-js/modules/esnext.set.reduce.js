'use strict';
var $ = require('../internals/export');
var aCallable = require('../internals/a-callable');
var SetHelpers = require('../internals/set-helpers');

var $TypeError = TypeError;
var aSet = SetHelpers.aSet;
var iterate = SetHelpers.iterate;

// `Set.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
$({ target: 'Set', proto: true, real: true, forced: true }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var set = aSet(this);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aCallable(callbackfn);
    iterate(set, function (value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = callbackfn(accumulator, value, value, set);
      }
    });
    if (noInitial) throw $TypeError('Reduce of empty set with no initial value');
    return accumulator;
  }
});
