{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the base 2 logarithm of x.
test 'Math.log2' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  {log2} = core.Math
  assert.ok typeof! log2 is \Function, 'is function'
  assert.same log2(''), log2 0
  assert.same log2(NaN), NaN
  assert.same log2(-1), NaN
  assert.same log2(0), -Infinity
  assert.same log2(-0), -Infinity
  assert.same log2(1), 0
  assert.same log2(Infinity), Infinity
  assert.same log2(0.5), -1
  assert.same log2(32), 5
  assert.ok epsilon log2(5), 2.321928094887362