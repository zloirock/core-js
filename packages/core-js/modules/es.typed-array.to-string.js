'use strict';
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var fails = require('../internals/fails');
var uncurryThis = require('../internals/function-uncurry-this');

var arrayToString = [].toString;
var join = uncurryThis([].join);

if (fails(function () { arrayToString.call({}); })) {
  arrayToString = function toString() {
    return join(this);
  };
}

var IS_NOT_ARRAY_METHOD = Int8Array.prototype.toString !== arrayToString;

// `%TypedArray%.prototype.toString` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tostring
exportTypedArrayMethod('toString', arrayToString, IS_NOT_ARRAY_METHOD);
