'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var toObject = require('../internals/to-object');
var arrayMethodIsStrict = require('../internals/array-method-is-strict');

// eslint-disable-next-line es/no-array-prototype-lastindexof -- safe
var $lastIndexOf = uncurryThis([].lastIndexOf);

var NEGATIVE_ZERO_BUG = 1 / $lastIndexOf([1], 1, -0) < 0;
var STRICT = arrayMethodIsStrict('lastIndexOf');

// `Array.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
$({ target: 'Array', proto: true, forced: NEGATIVE_ZERO_BUG || !STRICT }, {
  lastIndexOf: function lastIndexOf(searchElement /* , fromIndex = 0 */) {
    var O = toObject(this);
    return (arguments.length > 1 ? $lastIndexOf(O, searchElement, arguments[1]) : $lastIndexOf(O, searchElement)) || 0;
  },
});
