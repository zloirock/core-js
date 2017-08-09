{module, test} = QUnit
module \ES
# Returns the sign of the x, indicating whether x is positive, negative or zero.
test 'Math.sign' (assert)!->
  {sign} = core.Math
  assert.isFunction sign
  assert.same sign(NaN), NaN
  assert.same sign!, NaN
  assert.same sign(-0), -0
  assert.same sign(0), 0
  assert.strictEqual sign(Infinity), 1
  assert.strictEqual sign(-Infinity), -1
  assert.strictEqual sign(16~2fffffffffffff), 1
  assert.strictEqual sign(-16~2fffffffffffff), -1
  assert.strictEqual sign(42.5), 1
  assert.strictEqual sign(-42.5), -1