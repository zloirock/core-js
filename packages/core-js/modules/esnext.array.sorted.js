'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var arrayClone = require('../internals/array-clone');
var sort = require('../internals/array-sort');

// `Array.prototype.sorted` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.sorted
$({ target: 'Array', proto: true }, {
  sorted: function sorted(compareFn) {
    var O = arrayClone(this);
    sort.call(O, compareFn);
    return O;
  }
});

addToUnscopables('sorted');
