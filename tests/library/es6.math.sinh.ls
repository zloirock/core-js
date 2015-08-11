QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function
epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

test 'Math.sinh' !->
  # Returns an implementation-dependent approximation to the hyperbolic sine of x.
  {sinh} = core.Math
  ok isFunction(sinh), 'Is function'
  sameEq sinh(NaN), NaN
  sameEq sinh(0), 0
  sameEq sinh(-0), -0 
  eq sinh(Infinity), Infinity
  eq sinh(-Infinity), -Infinity
  ok epsilon sinh(-5), -74.20321057778875
  ok epsilon sinh(2), 3.6268604078470186
  eq sinh(-2e-17), -2e-17