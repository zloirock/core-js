'use strict';
var aTypedArrayConstructor = require('../internals/a-typed-array-constructor');
var exportTypedArrayStaticMethod = require('../internals/array-buffer-view-core').exportTypedArrayStaticMethod;
var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = require('../internals/typed-array-constructors-require-wrappers');

// `%TypedArray%.of` method
// https://tc39.es/ecma262/#sec-%typedarray%.of
exportTypedArrayStaticMethod('of', function of(/* ...items */) {
  var index = 0;
  var length = arguments.length;
  var result = new (aTypedArrayConstructor(this))(length);
  while (length > index) result[index] = arguments[index++];
  return result;
}, TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS);
