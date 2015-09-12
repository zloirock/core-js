{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
test 'Math.expm1' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  {expm1} = Math
  assert.ok typeof! expm1 is \Function, 'Is function'
  assert.ok /native code/.test(expm1), 'looks like native'
  sameValue expm1(NaN), NaN
  sameValue expm1(0), 0
  sameValue expm1(-0), -0
  assert.strictEqual expm1(Infinity), Infinity
  assert.strictEqual expm1(-Infinity), -1
  assert.ok epsilon expm1(10), 22025.465794806718,
  assert.ok epsilon expm1(-10), -0.9999546000702375