'use strict';
var fails = require('../internals/fails');
var uncurryThis = require('../internals/function-uncurry-this');
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/a-typed-array');

// dependency: es.array.entries
// eslint-disable-next-line es/no-array-prototype-entries -- safe
var arrayMethod = uncurryThis([].entries);

var GENERIC = !fails(function () {
  Int8Array.prototype.entries.call([1]);
});

// `%TypedArray%.prototype.entries` method
// https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
exportTypedArrayMethod('entries', function entries() {
  return arrayMethod(aTypedArray(this));
}, GENERIC);
