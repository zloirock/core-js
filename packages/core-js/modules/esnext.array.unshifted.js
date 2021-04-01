'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var slice = require('../internals/array-slice');

var unshift = [].unshift;

// `Array.prototype.unshifted` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.unshifted
$({ target: 'Array', proto: true }, {
  /* eslint-disable-next-line no-unused-vars -- required for `.length` */
  unshifted: function unshifted(item) {
    var A = slice.call(this);
    unshift.apply(A, arguments);
    return A;
  }
});

addToUnscopables('unshifted');
