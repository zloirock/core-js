'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/a-typed-array');
var arrayCopyWithin = require('../internals/array-copy-within');

var $arrayCopyWithin = uncurryThis(arrayCopyWithin);

// `%TypedArray%.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
exportTypedArrayMethod('copyWithin', function copyWithin(target, start /* , end */) {
  return $arrayCopyWithin(aTypedArray(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
});
