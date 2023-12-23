'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/array-buffer-view-core').aTypedArray;
var $ArrayCopyWithin = require('../internals/array-copy-within');

var u$ArrayCopyWithin = uncurryThis($ArrayCopyWithin);

// `%TypedArray%.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
exportTypedArrayMethod('copyWithin', function copyWithin(target, start /* , end */) {
  return u$ArrayCopyWithin(aTypedArray(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
});
