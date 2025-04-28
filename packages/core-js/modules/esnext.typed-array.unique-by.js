// type: proposals/array-unique.d.ts
'use strict';
var uncurryThis = require('../internals/function-uncurry-this');
var exportTypedArrayMethod = require('../internals/export-typed-array-method');
var aTypedArray = require('../internals/a-typed-array');
var getTypedArrayConstructor = require('../internals/get-typed-array-constructor');
var arrayFromConstructorAndList = require('../internals/array-from-constructor-and-list');
var $arrayUniqueBy = require('../internals/array-unique-by');

var arrayUniqueBy = uncurryThis($arrayUniqueBy);

// `%TypedArray%.prototype.uniqueBy` method
// https://github.com/tc39/proposal-array-unique
exportTypedArrayMethod('uniqueBy', function uniqueBy(resolver) {
  aTypedArray(this);
  return arrayFromConstructorAndList(getTypedArrayConstructor(this), arrayUniqueBy(this, resolver));
}, true);
