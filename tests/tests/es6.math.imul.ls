QUnit.module \ES6

eq = strictEqual
sameEq = (a, b, c)-> ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c

isFunction = -> typeof! it is \Function

test 'Math.imul' !->
  {imul} = Math
  ok isFunction(imul), 'Is function'
  ok /native code/.test(imul), 'looks like native'
  sameEq imul(0, 0), 0
  eq imul(123, 456), 56088
  eq imul(-123, 456), -56088
  eq imul(123, -456), -56088
  eq imul(16~01234567, 16~fedcba98), 602016552
  sameEq imul(no 7), 0
  sameEq imul(7 no), 0
  sameEq imul(no no), 0
  eq imul(on 7), 7
  eq imul(7 on), 7
  eq imul(on on), 1
  sameEq imul(void 7), 0
  sameEq imul(7 void), 0
  sameEq imul(void void), 0
  sameEq imul(\str 7), 0
  sameEq imul(7 \str), 0
  sameEq imul({} 7), 0
  sameEq imul(7 {}), 0
  sameEq imul([] 7), 0
  sameEq imul(7 []), 0
  eq imul(0xffffffff, 5), -5
  eq imul(0xfffffffe, 5), -10
  eq imul(2 4), 8
  eq imul(-1 8), -8
  eq imul(-2 -2), 4
  sameEq imul(-0 7), 0
  sameEq imul(7 -0), 0
  sameEq imul(0.1 7), 0
  sameEq imul(7 0.1), 0
  sameEq imul(0.9 7), 0
  sameEq imul(7 0.9), 0
  eq imul(1.1 7), 7
  eq imul(7 1.1), 7
  eq imul(1.9 7), 7
  eq imul(7 1.9), 7