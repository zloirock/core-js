'use strict';
// 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
var internalFind = require('../internals/array-methods')(5);
var KEY = 'find';
var FORCED = true;

// Shouldn't skip holes
if (KEY in []) Array(1)[KEY](function () { FORCED = false; });

// `Array.prototype.find` method
// https://tc39.github.io/ecma262/#sec-array.prototype.find
require('../internals/export')({ target: 'Array', proto: true, forced: FORCED }, {
  find: function find(callbackfn /* , that = undefined */) {
    return internalFind(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
require('../internals/add-to-unscopables')(KEY);
