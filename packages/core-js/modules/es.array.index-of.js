'use strict';
var $ = require('../internals/export');
var uncurryThis = require('../internals/function-uncurry-this');
var toObject = require('../internals/to-object');
var arrayMethodIsStrict = require('../internals/array-method-is-strict');

// eslint-disable-next-line es/no-array-prototype-indexof -- safe
var $indexOf = uncurryThis([].indexOf);

var NEGATIVE_ZERO_BUG = 1 / $indexOf([1], 1, -0) < 0;
var STRICT = arrayMethodIsStrict('indexOf');

// `Array.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.indexof
$({ target: 'Array', proto: true, forced: NEGATIVE_ZERO_BUG || !STRICT }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    return $indexOf(toObject(this), searchElement, arguments.length > 1 ? arguments[1] : undefined) || 0;
  },
});
