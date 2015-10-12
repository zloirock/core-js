{module, test} = QUnit
module \ES6
test \Uint8ClampedArray, !(assert)~>
  assert.isFunction Uint8ClampedArray
  assert.arity Uint8ClampedArray, 3
  assert.name Uint8ClampedArray, \Uint8ClampedArray
  assert.looksNative Uint8ClampedArray

  assert.same Uint8ClampedArray.BYTES_PER_ELEMENT, 1, '%TypedArray%.BYTES_PER_ELEMENT'
  a = new Uint8ClampedArray [1 2 3 4 5 6 7 8]
  assert.same a.BYTES_PER_ELEMENT, 1, '%TypedArray%#BYTES_PER_ELEMENT'
  assert.same a.byteOffset, 0, '%TypedArray%#byteOffset'
  assert.same a.byteLength, 8, '%TypedArray%#byteLength'

  source   = [-Infinity, -Number.MAX_VALUE, -1, -Number.MIN_VALUE, -0, 0, Number.MIN_VALUE, 1, 1.1, 1.9, 255, 255.1, 255.9, 256, Number.MAX_VALUE, Infinity, NaN]
  expected = [0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0]
  assert.arrayEqual new Uint8ClampedArray(source), expected, 'conversion, constructor <- array'
  array = new Uint8ClampedArray 1
  for i til source.length
    array[0] = source[i]
    assert.same array[0], expected[i], 'conversion, setter'