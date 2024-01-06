'use strict';
var fails = require('../internals/fails');
var uncurryThis = require('../internals/function-uncurry-this');
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/a-typed-array');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');

// dependency: es.array.iterator
var arrayMethod = uncurryThis([][ITERATOR]);
var typedArrayIterator = Int8Array.prototype[ITERATOR];

var GENERIC = !fails(function () {
  typedArrayIterator.call([1]);
});

var PROPER_NAME = typedArrayIterator
  && typedArrayIterator.name === 'values';

// `%TypedArray%.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator]
exportTypedArrayMethod(ITERATOR, function values() {
  return arrayMethod(aTypedArray(this));
}, GENERIC || !PROPER_NAME, { name: 'values' });
