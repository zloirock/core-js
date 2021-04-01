'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var slice = require('../internals/array-slice');

var pop = [].pop;

// `Array.prototype.popped` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.popped
$({ target: 'Array', proto: true }, {
  popped: function popped() {
    var A = slice.call(this);
    pop.call(A);
    return A;
  }
});

addToUnscopables('popped');
