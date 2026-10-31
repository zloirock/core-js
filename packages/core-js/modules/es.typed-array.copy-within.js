'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var fails = require('../internals/fails');
var aTypedArray = require('../internals/a-typed-array');
var arrayCopyWithin = require('../internals/array-copy-within');

var $arrayCopyWithin = uncurryThis(arrayCopyWithin);

// FF34 - each typed array class has its own `copyWithin`, which rejects the other classes
var DOES_NOT_WORK_WITH_DIFFERENT_TYPED_ARRAYS = fails(function () {
  return Int8Array.prototype.copyWithin.call(new Float32Array([1, 2, 3]), 0, 1)[1] !== 3;
});

// `%TypedArray%.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
exportTypedArrayMethod('copyWithin', function copyWithin(target, start /* , end */) {
  return $arrayCopyWithin(aTypedArray(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
}, DOES_NOT_WORK_WITH_DIFFERENT_TYPED_ARRAYS);
