{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
# The result is computed in a way that is accurate even when the value of x is close to zero.
test 'Math.log1p' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  {log1p} = Math
  assert.ok typeof! log1p is \Function, 'is function'
  assert.strictEqual log1p.name, \log1p, 'name is "log1p"'
  assert.strictEqual log1p.length, 1, 'arity is 1'
  assert.ok /native code/.test(log1p), 'looks like native'
  assert.same log1p(''), log1p 0
  assert.same log1p(NaN), NaN
  assert.same log1p(-2), NaN
  assert.same log1p(-1), -Infinity
  assert.same log1p(0), 0
  assert.same log1p(-0), -0
  assert.same log1p(Infinity), Infinity
  assert.ok epsilon log1p(5), 1.791759469228055
  assert.ok epsilon log1p(50), 3.9318256327243257