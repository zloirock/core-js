QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function
epsilon = (a, b, E)-> Math.abs(a - b) <= if E? => E else 1e-11

test 'Math.cosh' !->
  # Returns an implementation-dependent approximation to the hyperbolic cosine of x.
  {cosh} = Math
  ok isFunction(cosh), 'Is function'
  ok /native code/.test(cosh), 'looks like native'
  sameEq cosh(NaN), NaN
  eq cosh(0), 1
  eq cosh(-0), 1
  eq cosh(Infinity), Infinity
  eq cosh(-Infinity), Infinity # v8 bug!
  ok epsilon cosh(12), 81377.39571257407, 3e-11
  ok epsilon cosh(22), 1792456423.065795780980053377, 1e-5
  ok epsilon cosh(-10), 11013.23292010332313972137
  ok epsilon cosh(-23), 4872401723.1244513000, 1e-5