{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the hyperbolic tangent of x.
test 'Math.tanh' (assert)->
  {tanh} = Math
  assert.ok typeof! tanh is \Function, 'is function'
  assert.strictEqual tanh.name, \tanh, 'name is "tanh"'
  assert.strictEqual tanh.length, 1, 'arity is 1'
  assert.ok /native code/.test(tanh), 'looks like native'
  assert.same tanh(NaN), NaN
  assert.same tanh(0), 0
  assert.same tanh(-0), -0
  assert.strictEqual tanh(Infinity), 1
  assert.strictEqual tanh(90), 1
  assert.epsilon tanh(10), 0.9999999958776927
  #assert.strictEqual tanh(710), 1 #buggy v8 implementation