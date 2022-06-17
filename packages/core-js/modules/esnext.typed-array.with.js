'use strict';
var arrayWith = require('../internals/array-with');
var ArrayBufferViewCore = require('../internals/array-buffer-view-core');
var toIntegerOrInfinity = require('../internals/to-integer-or-infinity');
var toBigInt = require('../internals/to-big-int');
var classof = require('../internals/classof');
var uncurryThis = require('../internals/function-uncurry-this');

var aTypedArray = ArrayBufferViewCore.aTypedArray;
var getTypedArrayConstructor = ArrayBufferViewCore.getTypedArrayConstructor;
var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
var slice = uncurryThis(''.slice);

var PROPER_ORDER = !!function () {
  try {
    // eslint-disable-next-line no-throw-literal, es-x/no-typed-arrays -- required for testing
    new Int8Array(1)['with'](2, { valueOf: function () { throw 8; } });
  } catch (error) {
    // some early implementations, like WebKit, does not follow the final semantic
    // https://github.com/tc39/proposal-change-array-by-copy/pull/86
    return error === 8;
  }
}();

// `%TypedArray%.prototype.with` method
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.with
exportTypedArrayMethod('with', { 'with': function (index, value) {
  aTypedArray(this);
  var relativeIndex = toIntegerOrInfinity(index);
  var actualValue = slice(classof(this), 0, 3) === 'Big' ? toBigInt(value) : +value;
  return arrayWith(this, getTypedArrayConstructor(this), relativeIndex, actualValue);
} }['with'], !PROPER_ORDER);
