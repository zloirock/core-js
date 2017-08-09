{module, test} = QUnit
module \ES
# Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
test 'Math.expm1' (assert)!->
  {expm1} = core.Math
  assert.isFunction expm1
  assert.same expm1(NaN), NaN
  assert.same expm1(0), 0
  assert.same expm1(-0), -0
  assert.strictEqual expm1(Infinity), Infinity
  assert.strictEqual expm1(-Infinity), -1
  assert.epsilon expm1(10), 22025.465794806718,
  assert.epsilon expm1(-10), -0.9999546000702375