QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function
epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

test 'Math.acosh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic cosine of x.
  {acosh} = Math
  ok isFunction(acosh), 'Is function'
  ok /native code/.test(acosh), 'looks like native'
  sameEq acosh(NaN), NaN
  sameEq acosh(0.5), NaN
  sameEq acosh(-1), NaN
  sameEq acosh(-1e300), NaN
  sameEq acosh(1), 0
  eq acosh(Infinity), Infinity
  ok epsilon acosh(1234), 7.811163220849231
  ok epsilon acosh(8.88), 2.8737631531629235
  ok acosh(1e+160), 369.10676205960726
  #ok epsilon acosh(Number.MAX_VALUE), 710.475860073944 #buggy v8 implementation