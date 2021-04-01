'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var arrayClone = require('../internals/array-clone');

var reverse = [].reverse;

// `Array.prototype.reversed` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.reversed
$({ target: 'Array', proto: true }, {
  reversed: function reversed() {
    var O = arrayClone(this);
    reverse.call(O);
    return O;
  }
});

addToUnscopables('reversed');
