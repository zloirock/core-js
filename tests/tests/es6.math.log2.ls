{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the base 2 logarithm of x.
test 'Math.log2' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  {log2} = Math
  assert.ok typeof! log2 is \Function, 'Is function'
  assert.ok /native code/.test(log2), 'looks like native'
  sameValue log2(''), log2 0
  sameValue log2(NaN), NaN
  sameValue log2(-1), NaN
  sameValue log2(0), -Infinity
  sameValue log2(-0), -Infinity
  sameValue log2(1), 0
  sameValue log2(Infinity), Infinity
  sameValue log2(0.5), -1
  sameValue log2(32), 5
  assert.ok epsilon log2(5), 2.321928094887362