QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function

test 'Math.clz32' !->
  {clz32} = Math
  ok isFunction(clz32), 'Is function'
  ok /native code/.test(clz32), 'looks like native'
  eq clz32(0), 32
  eq clz32(1), 31
  sameEq clz32(-1), 0
  eq clz32(0.6), 32
  sameEq clz32(2^32 - 1), 0
  eq clz32(2^32), 32