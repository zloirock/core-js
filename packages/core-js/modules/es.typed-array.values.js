'use strict';
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var wellKnownSymbol = require('../internals/well-known-symbol');

var ITERATOR = wellKnownSymbol('iterator');
var Int8ArrayPrototype = Int8Array.prototype;
// @dependency: es.typed-array.iterator
var typedArrayIterator = Int8ArrayPrototype[ITERATOR];

var ITERATOR_IS_VALUES = Int8ArrayPrototype.values === typedArrayIterator;

// `%TypedArray%.prototype.values` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
exportTypedArrayMethod('values', typedArrayIterator, !ITERATOR_IS_VALUES, { name: 'values' });
