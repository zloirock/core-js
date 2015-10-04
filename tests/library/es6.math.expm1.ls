{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
test 'Math.expm1' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  {expm1} = core.Math
  assert.ok typeof! expm1 is \Function, 'is function'
  assert.same expm1(NaN), NaN
  assert.same expm1(0), 0
  assert.same expm1(-0), -0
  assert.strictEqual expm1(Infinity), Infinity
  assert.strictEqual expm1(-Infinity), -1
  assert.ok epsilon expm1(10), 22025.465794806718,
  assert.ok epsilon expm1(-10), -0.9999546000702375