'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var arrayClone = require('../internals/array-clone');

var shift = [].shift;

// `Array.prototype.shifted` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.shifted
$({ target: 'Array', proto: true }, {
  shifted: function shifted() {
    var O = arrayClone(this);
    shift.call(O);
    return O;
  }
});

addToUnscopables('shifted');
