'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var slice = require('../internals/array-slice');

var push = [].push;

// `Array.prototype.pushed` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.pushed
$({ target: 'Array', proto: true }, {
  /* eslint-disable-next-line no-unused-vars -- required for `.length` */
  pushed: function pushed(item) {
    var A = slice.call(this);
    push.apply(A, arguments);
    return A;
  }
});

addToUnscopables('pushed');
