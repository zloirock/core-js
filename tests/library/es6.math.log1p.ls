{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
# The result is computed in a way that is accurate even when the value of x is close to zero.
test 'Math.log1p' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  {log1p} = core.Math
  assert.ok typeof! log1p is \Function, 'is function'
  sameValue log1p(''), log1p 0
  sameValue log1p(NaN), NaN
  sameValue log1p(-2), NaN
  sameValue log1p(-1), -Infinity
  sameValue log1p(0), 0
  sameValue log1p(-0), -0
  sameValue log1p(Infinity), Infinity
  assert.ok epsilon log1p(5), 1.791759469228055
  assert.ok epsilon log1p(50), 3.9318256327243257