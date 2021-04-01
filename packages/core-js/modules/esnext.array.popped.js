'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var arrayClone = require('../internals/array-clone');

var pop = [].pop;

// `Array.prototype.popped` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.popped
$({ target: 'Array', proto: true }, {
  popped: function popped() {
    var O = arrayClone(this);
    pop.call(O);
    return O;
  }
});

addToUnscopables('popped');
