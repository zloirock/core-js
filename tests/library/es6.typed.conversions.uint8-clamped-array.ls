{module, test} = QUnit
module \ES6
DESCRIPTORS and test 'Uint8ClampedArray conversions', !(assert)~>
  {Uint8ClampedArray} = core
  source   = [-Infinity, -Number.MAX_VALUE, -1, -Number.MIN_VALUE, -0, 0, Number.MIN_VALUE, 1, 1.1, 1.9, 255, 255.1, 255.9, 256, Number.MAX_VALUE, Infinity, NaN]
  expected = [0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0]
  assert.arrayEqual new Uint8ClampedArray(source), expected, 'conversion, constructor <- array'
  array = new Uint8ClampedArray 1
  for i til source.length
    array[0] = source[i]
    assert.same array[0], expected[i], 'conversion, setter'