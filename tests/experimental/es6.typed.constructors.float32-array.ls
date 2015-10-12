{module, test} = QUnit
module \ES6
test \Float32Array, !(assert)~>
  assert.isFunction Float32Array
  assert.arity Float32Array, 3
  assert.name Float32Array, \Float32Array
  assert.looksNative Float32Array

  assert.same Float32Array.BYTES_PER_ELEMENT, 4, '%TypedArray%.BYTES_PER_ELEMENT'
  a = new Float32Array [1 2 3 4 5 6 7 8]
  assert.same a.BYTES_PER_ELEMENT, 4, '%TypedArray%#BYTES_PER_ELEMENT'
  assert.same a.byteOffset, 0, '%TypedArray%#byteOffset'
  assert.same a.byteLength, 32, '%TypedArray%#byteLength'