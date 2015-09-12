{module, test} = QUnit
module \ES6

test 'Math.fround' (assert)->
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  # https://github.com/paulmillr/es6-shim/blob/master/test/math.js
  {fround} = Math
  assert.ok typeof! fround is \Function, 'Is function'
  assert.ok /native code/.test(fround), 'looks like native'
  sameValue fround(void), NaN
  sameValue fround(NaN), NaN
  sameValue fround(0), 0
  sameValue fround(-0), -0
  sameValue fround(Number.MIN_VALUE), 0
  sameValue fround(-Number.MIN_VALUE), -0
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
  sameValue fround(minFloat32 / 2), 0
  sameValue fround(-minFloat32 / 2), -0
  assert.strictEqual fround(minFloat32 / 2 + 2 ** -202), minFloat32
  assert.strictEqual fround(-minFloat32 / 2 - 2 ** -202), -minFloat32