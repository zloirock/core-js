{module, test} = QUnit
module \ES
# Returns an implementation-dependent approximation to the hyperbolic sine of x.
test 'Math.sinh' (assert)!->
  {sinh} = Math
  assert.isFunction sinh
  assert.name sinh, \sinh
  assert.arity sinh, 1
  assert.looksNative sinh
  assert.nonEnumerable Math, \sinh
  assert.same sinh(NaN), NaN
  assert.same sinh(0), 0
  assert.same sinh(-0), -0 
  assert.strictEqual sinh(Infinity), Infinity
  assert.strictEqual sinh(-Infinity), -Infinity
  assert.epsilon sinh(-5), -74.20321057778875
  assert.epsilon sinh(2), 3.6268604078470186
  assert.strictEqual sinh(-2e-17), -2e-17