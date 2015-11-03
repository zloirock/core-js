{module, test} = QUnit
module \ES6
DESCRIPTORS and test \Uint16Array, !(assert)~>
  assert.isFunction Uint16Array
  assert.arity Uint16Array, 3
  assert.name Uint16Array, \Uint16Array
  assert.looksNative Uint16Array

  assert.same Uint16Array.BYTES_PER_ELEMENT, 2, '%TypedArray%.BYTES_PER_ELEMENT'
  a = new Uint16Array [1 2 3 4 5 6 7 8]
  assert.same a.BYTES_PER_ELEMENT, 2, '%TypedArray%#BYTES_PER_ELEMENT'
  assert.same a.byteOffset, 0, '%TypedArray%#byteOffset'
  assert.same a.byteLength, 16, '%TypedArray%#byteLength'