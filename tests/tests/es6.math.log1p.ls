QUnit.module \ES6

sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function
epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

test 'Math.log1p' !->
  # Returns an implementation-dependent approximation to the natural logarithm of 1 + x.
  # The result is computed in a way that is accurate even when the value of x is close to zero.
  {log1p} = Math
  ok isFunction(log1p), 'Is function'
  ok /native code/.test(log1p), 'looks like native'
  sameEq log1p(''), log1p 0
  sameEq log1p(NaN), NaN
  sameEq log1p(-2), NaN
  sameEq log1p(-1), -Infinity
  sameEq log1p(0), 0
  sameEq log1p(-0), -0
  sameEq log1p(Infinity), Infinity
  ok epsilon log1p(5), 1.791759469228055
  ok epsilon log1p(50), 3.9318256327243257