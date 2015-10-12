{module, test} = QUnit
module \ES6
test \Uint8Array, !(assert)~>
  assert.isFunction Uint8Array
  assert.arity Uint8Array, 3
  assert.name Uint8Array, \Uint8Array
  assert.looksNative Uint8Array

  assert.same Uint8Array.BYTES_PER_ELEMENT, 1, '%TypedArray%.BYTES_PER_ELEMENT'
  a = new Uint8Array [1 2 3 4 5 6 7 8]
  assert.same a.BYTES_PER_ELEMENT, 1, '%TypedArray%#BYTES_PER_ELEMENT'
  assert.same a.byteOffset, 0, '%TypedArray%#byteOffset'
  assert.same a.byteLength, 8, '%TypedArray%#byteLength'