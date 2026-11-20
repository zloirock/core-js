'use strict';
var $ = require('../internals/export');
var anObject = require('../internals/an-object');
var fails = require('../internals/fails');
var toPropertyKey = require('../internals/to-property-key');

// Rhino 1.8.0 - 1.9.2 misses indexed properties, even when the target owns them.
// https://github.com/mozilla/rhino/issues/2599
var INCORRECT_INDEX = fails(function () {
  // eslint-disable-next-line es/no-reflect -- required for testing
  return !Reflect.has([1], 0);
});

// `Reflect.has` method
// https://tc39.es/ecma262/#sec-reflect.has
$({ target: 'Reflect', stat: true, forced: INCORRECT_INDEX }, {
  has: function has(target, propertyKey) {
    anObject(target);
    // V8 3.31 - 4.6 misses inherited array indices with a numeric left operand of `in`.
    return toPropertyKey(propertyKey) in target;
  }
});
