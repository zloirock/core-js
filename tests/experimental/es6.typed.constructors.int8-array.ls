{module, test} = QUnit
module \ES6
DESCRIPTORS and test \Int8Array, !(assert)~>
  assert.isFunction Int8Array
  assert.arity Int8Array, 3
  assert.name Int8Array, \Int8Array
  assert.looksNative Int8Array

  assert.same Int8Array.BYTES_PER_ELEMENT, 1, '%TypedArray%.BYTES_PER_ELEMENT'
  a = new Int8Array [1 2 3 4 5 6 7 8]
  assert.same a.BYTES_PER_ELEMENT, 1, '%TypedArray%#BYTES_PER_ELEMENT'
  assert.same a.byteOffset, 0, '%TypedArray%#byteOffset'
  assert.same a.byteLength, 8, '%TypedArray%#byteLength'