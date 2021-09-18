'use strict';
var aConstructor = require('../internals/a-constructor');
var arrayFromAsync = require('../internals/array-from-async');
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = require('../internals/typed-array-constructors-require-wrappers');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var arrayFromConstructorAndList = require('../internals/array-from-constructor-and-list');

var aTypedArrayConstructor = ArrayBufferViewCore.aTypedArrayConstructor;
var exportTypedArrayStaticMethod = ArrayBufferViewCore.exportTypedArrayStaticMethod;

// `%TypedArray%.fromAsync` method
// https://github.com/tc39/proposal-array-from-async
// eslint-disable-next-line -- required for .length
exportTypedArrayStaticMethod('fromAsync', function fromAsync(asyncItems /* , mapfn = undefined, thisArg = undefined */) {
  var C = aConstructor(this);
  return arrayFromAsync.apply(Array, arguments).then(function (list) {
    return arrayFromConstructorAndList(aTypedArrayConstructor(C), list);
  });
}, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS);
