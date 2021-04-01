'use strict';
var $ = require('../internals/export');
var arrayClone = require('../internals/array-clone');

// `Array.prototype.with` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.with
$({ target: 'Array', proto: true }, {
  'with': function (index, value) {
    var O = arrayClone(this);
    O[index] = value;
    return O;
  }
});
