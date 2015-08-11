QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function
epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

test 'Math.expm1' !->
  # Returns an implementation-dependent approximation to subtracting 1 from the exponential function of x 
  {expm1} = core.Math
  ok isFunction(expm1), 'Is function'
  sameEq expm1(NaN), NaN
  sameEq expm1(0), 0
  sameEq expm1(-0), -0
  eq expm1(Infinity), Infinity
  eq expm1(-Infinity), -1
  ok epsilon expm1(10), 22025.465794806718,
  ok epsilon expm1(-10), -0.9999546000702375