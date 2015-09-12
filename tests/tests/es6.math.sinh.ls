{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the hyperbolic sine of x.
test 'Math.sinh' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  {sinh} = Math
  assert.ok typeof! sinh is \Function, 'Is function'
  assert.ok /native code/.test(sinh), 'looks like native'
  sameValue sinh(NaN), NaN
  sameValue sinh(0), 0
  sameValue sinh(-0), -0 
  assert.strictEqual sinh(Infinity), Infinity
  assert.strictEqual sinh(-Infinity), -Infinity
  assert.ok epsilon sinh(-5), -74.20321057778875
  assert.ok epsilon sinh(2), 3.6268604078470186
  assert.strictEqual sinh(-2e-17), -2e-17