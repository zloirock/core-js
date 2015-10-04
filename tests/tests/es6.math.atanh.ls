{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the inverse hyperbolic tangent of x.
test 'Math.atanh' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  {atanh} = Math
  assert.ok typeof! atanh is \Function, 'is function'
  assert.strictEqual atanh.name, \atanh, 'name is "atanh"'
  assert.strictEqual atanh.length, 1, 'arity is 1'
  assert.ok /native code/.test(atanh), 'looks like native'
  assert.same atanh(NaN), NaN
  assert.same atanh(-2), NaN
  assert.same atanh(-1.5), NaN
  assert.same atanh(2), NaN
  assert.same atanh(1.5), NaN
  assert.strictEqual atanh(-1), -Infinity
  assert.strictEqual atanh(1), Infinity
  assert.same atanh(0), 0
  assert.same atanh(-0), -0
  assert.same atanh(-1e300), NaN
  assert.same atanh(1e300), NaN
  assert.ok epsilon atanh(0.5), 0.5493061443340549
  assert.ok epsilon atanh(-0.5), -0.5493061443340549
  assert.ok epsilon atanh(0.444), 0.47720201260109457