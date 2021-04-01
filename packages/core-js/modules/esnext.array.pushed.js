'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var arrayClone = require('../internals/array-clone');

var push = [].push;

// `Array.prototype.pushed` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.pushed
$({ target: 'Array', proto: true }, {
  /* eslint-disable-next-line no-unused-vars -- required for `.length` */
  pushed: function pushed(item) {
    var O = arrayClone(this);
    push.apply(O, arguments);
    return O;
  }
});

addToUnscopables('pushed');
