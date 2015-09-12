{module, test} = QUnit
module \ES6
# Returns an implementation-dependent approximation to the base 10 logarithm of x.
test 'Math.log10' (assert)->
  epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  {log10} = core.Math
  assert.ok typeof! log10 is \Function, 'Is function'
  sameValue log10(''), log10 0
  sameValue log10(NaN), NaN
  sameValue log10(-1), NaN
  sameValue log10(0), -Infinity
  sameValue log10(-0), -Infinity
  sameValue log10(1), 0
  sameValue log10(Infinity), Infinity
  assert.ok epsilon log10(0.1), -1 # O_o
  assert.ok epsilon log10(0.5), -0.3010299956639812
  assert.ok epsilon log10(1.5), 0.17609125905568124
  assert.ok epsilon log10(5), 0.6989700043360189
  assert.ok epsilon log10(50), 1.6989700043360187