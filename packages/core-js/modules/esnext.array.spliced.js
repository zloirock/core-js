'use strict';
var $ = require('../internals/export');
var addToUnscopables = require('../internals/add-to-unscopables');
var arrayClone = require('../internals/array-clone');
var splice = require('../internals/array-splice');

// `Array.prototype.spliced` method
// http://www.rricard.me/proposal-change-array-by-copy/#sec-array.prototype.spliced
$({ target: 'Array', proto: true }, {
  /* eslint-disable-next-line no-unused-vars -- required for `.length` */
  spliced: function spliced(start, deleteCount) {
    var O = arrayClone(this);
    splice.apply(O, arguments);
    return O;
  }
});

addToUnscopables('spliced');
