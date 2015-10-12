{module, test} = QUnit
module \ES6
test \Int16Array, !(assert)~>
  assert.isFunction Int16Array
  assert.arity Int16Array, 3
  assert.name Int16Array, \Int16Array
  assert.looksNative Int16Array

  assert.same Int16Array.BYTES_PER_ELEMENT, 2, '%TypedArray%.BYTES_PER_ELEMENT'
  a = new Int16Array [1 2 3 4 5 6 7 8]
  assert.same a.BYTES_PER_ELEMENT, 2, '%TypedArray%#BYTES_PER_ELEMENT'
  assert.same a.byteOffset, 0, '%TypedArray%#byteOffset'
  assert.same a.byteLength, 16, '%TypedArray%#byteLength'