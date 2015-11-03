{module, test} = QUnit
module \ES6
DESCRIPTORS and test \Int32Array, !(assert)~>
  assert.isFunction Int32Array
  assert.arity Int32Array, 3
  assert.name Int32Array, \Int32Array
  assert.looksNative Int32Array

  assert.same Int32Array.BYTES_PER_ELEMENT, 4, '%TypedArray%.BYTES_PER_ELEMENT'
  a = new Int32Array [1 2 3 4 5 6 7 8]
  assert.same a.BYTES_PER_ELEMENT, 4, '%TypedArray%#BYTES_PER_ELEMENT'
  assert.same a.byteOffset, 0, '%TypedArray%#byteOffset'
  assert.same a.byteLength, 32, '%TypedArray%#byteLength'