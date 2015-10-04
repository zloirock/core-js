{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the base 10 logarithm of x.
test 'Math.log10' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  {log10} = core.Math
  assert.ok typeof! log10 is \Function, 'is function'
  assert.same log10(''), log10 0
  assert.same log10(NaN), NaN
  assert.same log10(-1), NaN
  assert.same log10(0), -Infinity
  assert.same log10(-0), -Infinity
  assert.same log10(1), 0
  assert.same log10(Infinity), Infinity
  assert.ok epsilon log10(0.1), -1 # O_o
  assert.ok epsilon log10(0.5), -0.3010299956639812
  assert.ok epsilon log10(1.5), 0.17609125905568124
  assert.ok epsilon log10(5), 0.6989700043360189
  assert.ok epsilon log10(50), 1.6989700043360187