'use strict';
var $ = require('../internals/export');
var iterate = require('../internals/iterate');
var aFunction = require('../internals/a-function');
var anObject = require('../internals/an-object');

$({ target: 'Iterator', proto: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    anObject(this);
    aFunction(reducer);
    var hasInitialValue = arguments.length > 1;
    var accumulator = hasInitialValue ? arguments[1] : undefined;
    var empty = true;
    iterate(this, function (value) {
      if (empty && !hasInitialValue) {
        empty = false;
        accumulator = value;
      } else {
        accumulator = reducer(accumulator, value);
      }
    }, undefined, false, true);
    if (empty && !hasInitialValue) throw TypeError('Reduce of empty iterator with no initial value');
    return accumulator;
  }
});
