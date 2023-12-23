'use strict';
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/array-buffer-view-core').aTypedArray;
var uncurryThis = require('../internals/function-uncurry-this');

// eslint-disable-next-line es/no-array-prototype-indexof -- safe
var $indexOf = uncurryThis([].indexOf);

// `%TypedArray%.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
exportTypedArrayMethod('indexOf', function indexOf(searchElement /* , fromIndex */) {
  var O = aTypedArray(this);
  return (arguments.length > 1 ? $indexOf(O, searchElement, arguments[1]) : $indexOf(O, searchElement)) || 0;
});
