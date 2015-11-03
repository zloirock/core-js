{module, test} = QUnit
module \ES6
DESCRIPTORS and test \Uint32Array, !(assert)~>
  assert.isFunction Uint32Array
  assert.arity Uint32Array, 3
  assert.name Uint32Array, \Uint32Array
  assert.looksNative Uint32Array

  assert.same Uint32Array.BYTES_PER_ELEMENT, 4, '%TypedArray%.BYTES_PER_ELEMENT'
  a = new Uint32Array [1 2 3 4 5 6 7 8]
  assert.same a.BYTES_PER_ELEMENT, 4, '%TypedArray%#BYTES_PER_ELEMENT'
  assert.same a.byteOffset, 0, '%TypedArray%#byteOffset'
  assert.same a.byteLength, 32, '%TypedArray%#byteLength'