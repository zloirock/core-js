QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function
epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

test 'Math.tanh' !->
  # Returns an implementation-dependent approximation to the hyperbolic tangent of x.
  {tanh} = Math
  ok isFunction(tanh), 'Is function'
  ok /native code/.test(tanh), 'looks like native'
  sameEq tanh(NaN), NaN
  sameEq tanh(0), 0
  sameEq tanh(-0), -0
  eq tanh(Infinity), 1
  eq tanh(90), 1
  ok epsilon tanh(10), 0.9999999958776927
  #eq tanh(710), 1 #buggy v8 implementation