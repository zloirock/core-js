{module, test} = QUnit
module \ES

test 'Math.fround' (assert)!->
  # https://github.com/paulmillr/es6-shim/blob/master/test/math.js
  {fround} = Math
  assert.isFunction fround
  assert.name fround, \fround
  assert.arity fround, 1
  assert.looksNative fround
  assert.nonEnumerable Math, \fround
  assert.same fround(void), NaN
  assert.same fround(NaN), NaN
  assert.same fround(0), 0
  assert.same fround(-0), -0
  assert.same fround(Number.MIN_VALUE), 0
  assert.same fround(-Number.MIN_VALUE), -0
  assert.strictEqual fround(Infinity), Infinity
  assert.strictEqual fround(-Infinity), -Infinity
  assert.strictEqual fround(1.7976931348623157e+308), Infinity
  assert.strictEqual fround(-1.7976931348623157e+308), -Infinity
  assert.strictEqual fround(3.4028235677973366e+38), Infinity
  assert.strictEqual fround(3), 3
  assert.strictEqual fround(-3), -3
  maxFloat32 = 3.4028234663852886e+38
  minFloat32 = 1.401298464324817e-45
  assert.strictEqual fround(maxFloat32), maxFloat32
  assert.strictEqual fround(-maxFloat32), -maxFloat32
  assert.strictEqual fround(maxFloat32 + 2 ** (2 ** (8 - 1) - 1 - 23 - 2)), maxFloat32
  assert.strictEqual fround(minFloat32), minFloat32
  assert.strictEqual fround(-minFloat32), -minFloat32
  assert.same fround(minFloat32 / 2), 0
  assert.same fround(-minFloat32 / 2), -0
  assert.strictEqual fround(minFloat32 / 2 + 2 ** -202), minFloat32
  assert.strictEqual fround(-minFloat32 / 2 - 2 ** -202), -minFloat32