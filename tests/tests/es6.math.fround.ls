QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function

test 'Math.fround' !->
  # https://github.com/paulmillr/es6-shim/blob/master/test/math.js
  {fround} = Math
  ok isFunction(fround), 'Is function'
  ok /native code/.test(fround), 'looks like native'
  sameEq fround(void), NaN
  sameEq fround(NaN), NaN
  sameEq fround(0), 0
  sameEq fround(-0), -0
  sameEq fround(Number.MIN_VALUE), 0
  sameEq fround(-Number.MIN_VALUE), -0
  eq fround(Infinity), Infinity
  eq fround(-Infinity), -Infinity
  eq fround(1.7976931348623157e+308), Infinity
  eq fround(-1.7976931348623157e+308), -Infinity
  eq fround(3.4028235677973366e+38), Infinity
  eq fround(3), 3
  eq fround(-3), -3
  maxFloat32 = 3.4028234663852886e+38
  minFloat32 = 1.401298464324817e-45
  eq fround(maxFloat32), maxFloat32
  eq fround(-maxFloat32), -maxFloat32
  eq fround(maxFloat32 + 2 ** (2 ** (8 - 1) - 1 - 23 - 2)), maxFloat32
  eq fround(minFloat32), minFloat32
  eq fround(-minFloat32), -minFloat32
  sameEq fround(minFloat32 / 2), 0
  sameEq fround(-minFloat32 / 2), -0
  eq fround(minFloat32 / 2 + 2 ** -202), minFloat32
  eq fround(-minFloat32 / 2 - 2 ** -202), -minFloat32