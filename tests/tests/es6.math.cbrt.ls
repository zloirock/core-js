{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the cube root of x.
test 'Math.cbrt' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  {cbrt} = Math
  assert.ok typeof! cbrt is \Function, 'is function'
  assert.strictEqual cbrt.name, \cbrt, 'name is "cbrt"'
  assert.strictEqual cbrt.length, 1, 'arity is 1'
  assert.ok /native code/.test(cbrt), 'looks like native'
  assert.same cbrt(NaN), NaN
  assert.same cbrt(0), 0
  assert.same cbrt(-0), -0
  assert.strictEqual cbrt(Infinity), Infinity
  assert.strictEqual cbrt(-Infinity), -Infinity
  assert.strictEqual cbrt(-8), -2
  assert.strictEqual cbrt(8), 2
  assert.ok epsilon cbrt(-1000), -10 # O_o
  assert.ok epsilon cbrt(1000), 10   # O_o