QUnit.module \ES6

sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function
epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

test 'Math.log2' !->
  # Returns an implementation-dependent approximation to the base 2 logarithm of x.
  {log2} = Math
  ok isFunction(log2), 'Is function'
  ok /native code/.test(log2), 'looks like native'
  sameEq log2(''), log2 0
  sameEq log2(NaN), NaN
  sameEq log2(-1), NaN
  sameEq log2(0), -Infinity
  sameEq log2(-0), -Infinity
  sameEq log2(1), 0
  sameEq log2(Infinity), Infinity
  sameEq log2(0.5), -1
  sameEq log2(32), 5
  ok epsilon log2(5), 2.321928094887362