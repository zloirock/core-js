'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var arrayClone = require('../internals/array-clone');

var unshift = [].unshift;

// `Array.prototype.unshifted` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.unshifted
$({ target: 'Array', proto: true }, {
  /* eslint-disable-next-line no-unused-vars -- required for `.length` */
  unshifted: function unshifted(item) {
    var O = arrayClone(this);
    unshift.apply(O, arguments);
    return O;
  }
});

addToUnscopables('unshifted');
