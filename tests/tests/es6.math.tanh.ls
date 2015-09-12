{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the hyperbolic tangent of x.
test 'Math.tanh' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  {tanh} = Math
  assert.ok typeof! tanh is \Function, 'Is function'
  assert.ok /native code/.test(tanh), 'looks like native'
  sameValue tanh(NaN), NaN
  sameValue tanh(0), 0
  sameValue tanh(-0), -0
  assert.strictEqual tanh(Infinity), 1
  assert.strictEqual tanh(90), 1
  assert.ok epsilon tanh(10), 0.9999999958776927
  #assert.strictEqual tanh(710), 1 #buggy v8 implementation