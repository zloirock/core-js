'use strict';
// 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
var internalFindIndex = require('./_array-methods')(6);
var KEY = 'findIndex';
var FORCED = true;

// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { FORCED = false; });

// `Array.prototype.findIndex` method
// https://tc39.github.io/ecma262/#sec-array.prototype.findindex
require('./_export')({ target: 'Array', proto: true, forced: FORCED }, {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return internalFindIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
require('./_add-to-unscopables')(KEY);
