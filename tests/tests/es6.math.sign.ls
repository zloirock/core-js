QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function

test 'Math.sign' !->
  # Returns the sign of the x, indicating whether x is positive, negative or zero.
  {sign} = Math
  ok isFunction(sign), 'Is function'
  ok /native code/.test(sign), 'looks like native'
  sameEq sign(NaN), NaN
  sameEq sign!, NaN
  sameEq sign(-0), -0
  sameEq sign(0), 0
  eq sign(Infinity), 1
  eq sign(-Infinity), -1
  eq sign(16~2fffffffffffff), 1
  eq sign(-16~2fffffffffffff), -1
  eq sign(42.5), 1
  eq sign(-42.5), -1