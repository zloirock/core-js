QUnit.module \ES6

sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function
epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

test 'Math.log10' !->
  # Returns an implementation-dependent approximation to the base 10 logarithm of x.
  {log10} = core.Math
  ok isFunction(log10), 'Is function'
  sameEq log10(''), log10 0
  sameEq log10(NaN), NaN
  sameEq log10(-1), NaN
  sameEq log10(0), -Infinity
  sameEq log10(-0), -Infinity
  sameEq log10(1), 0
  sameEq log10(Infinity), Infinity
  ok epsilon log10(0.1), -1 # O_o
  ok epsilon log10(0.5), -0.3010299956639812
  ok epsilon log10(1.5), 0.17609125905568124
  ok epsilon log10(5), 0.6989700043360189
  ok epsilon log10(50), 1.6989700043360187