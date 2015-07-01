QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function
epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

test 'Math.atanh' !->
  # Returns an implementation-dependent approximation to the inverse hyperbolic tangent of x.
  {atanh} = Math
  ok isFunction(atanh), 'Is function'
  ok /native code/.test(atanh), 'looks like native'
  sameEq atanh(NaN), NaN
  sameEq atanh(-2), NaN
  sameEq atanh(-1.5), NaN
  sameEq atanh(2), NaN
  sameEq atanh(1.5), NaN
  eq atanh(-1), -Infinity
  eq atanh(1), Infinity
  sameEq atanh(0), 0
  sameEq atanh(-0), -0
  sameEq atanh(-1e300), NaN
  sameEq atanh(1e300), NaN
  ok epsilon atanh(0.5), 0.5493061443340549
  ok epsilon atanh(-0.5), -0.5493061443340549
  ok epsilon atanh(0.444), 0.47720201260109457