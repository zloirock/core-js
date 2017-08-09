{module, test} = QUnit
module \ES
# Returns an implementation-dependent approximation to the base 10 logarithm of x.
test 'Math.log10' (assert)!->
  {log10} = core.Math
  assert.isFunction log10
  assert.same log10(''), log10 0
  assert.same log10(NaN), NaN
  assert.same log10(-1), NaN
  assert.same log10(0), -Infinity
  assert.same log10(-0), -Infinity
  assert.same log10(1), 0
  assert.same log10(Infinity), Infinity
  assert.epsilon log10(0.1), -1 # O_o
  assert.epsilon log10(0.5), -0.3010299956639812
  assert.epsilon log10(1.5), 0.17609125905568124
  assert.epsilon log10(5), 0.6989700043360189
  assert.epsilon log10(50), 1.6989700043360187
  assert.epsilon log10(1000), 3