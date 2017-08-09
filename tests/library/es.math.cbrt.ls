{module, test} = QUnit
module \ES
# Returns an implementation-dependent approximation to the cube root of x.
test 'Math.cbrt' (assert)!->
  {cbrt} = core.Math
  assert.isFunction cbrt
  assert.same cbrt(NaN), NaN
  assert.same cbrt(0), 0
  assert.same cbrt(-0), -0
  assert.strictEqual cbrt(Infinity), Infinity
  assert.strictEqual cbrt(-Infinity), -Infinity
  assert.strictEqual cbrt(-8), -2
  assert.strictEqual cbrt(8), 2
  assert.epsilon cbrt(-1000), -10 # O_o
  assert.epsilon cbrt(1000), 10   # O_o