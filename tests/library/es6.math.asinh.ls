QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function
epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

test 'Math.asinh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic sine of x.
  {asinh} = core.Math
  ok isFunction(asinh), 'Is function'
  sameEq asinh(NaN), NaN
  sameEq asinh(0), 0
  sameEq asinh(-0), -0
  eq asinh(Infinity), Infinity
  eq asinh(-Infinity), -Infinity
  ok epsilon asinh(1234), 7.811163549201245
  ok epsilon asinh(9.99), 2.997227420191335
  ok epsilon asinh(1e150), 346.0809111296668
  ok epsilon asinh(1e7), 16.811242831518268
  ok epsilon asinh(-1e7), -16.811242831518268