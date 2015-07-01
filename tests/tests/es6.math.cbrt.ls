QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function
epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

test 'Math.cbrt' !->
  # Returns an implementation-dependent approximation to the cube root of x.
  {cbrt} = Math
  ok isFunction(cbrt), 'Is function'
  ok /native code/.test(cbrt), 'looks like native'
  sameEq cbrt(NaN), NaN
  sameEq cbrt(0), 0
  sameEq cbrt(-0), -0
  eq cbrt(Infinity), Infinity
  eq cbrt(-Infinity), -Infinity
  eq cbrt(-8), -2
  eq cbrt(8), 2
  ok epsilon cbrt(-1000), -10 # O_o
  ok epsilon cbrt(1000), 10   # O_o