{module, test} = QUnit
module \ES6
test \Float64Array, !(assert)~>
  assert.isFunction Float64Array
  assert.arity Float64Array, 3
  assert.name Float64Array, \Float64Array
  assert.looksNative Float64Array

  assert.same Float64Array.BYTES_PER_ELEMENT, 8, '%TypedArray%.BYTES_PER_ELEMENT'
  a = new Float64Array [1 2 3 4 5 6 7 8]
  assert.same a.BYTES_PER_ELEMENT, 8, '%TypedArray%#BYTES_PER_ELEMENT'
  assert.same a.byteOffset, 0, '%TypedArray%#byteOffset'
  assert.same a.byteLength, 64, '%TypedArray%#byteLength'