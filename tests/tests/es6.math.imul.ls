{module, test} = QUnit
module \ES6

test 'Math.imul' (assert)->
  sameValue = (a, b, c)-> assert.ok (if a is b => a isnt 0 or 1 / a is 1 / b else a !~= a and b !~= b), c
  {imul} = Math
  assert.ok typeof! imul is \Function, 'Is function'
  assert.ok /native code/.test(imul), 'looks like native'
  sameValue imul(0, 0), 0
  assert.strictEqual imul(123, 456), 56088
  assert.strictEqual imul(-123, 456), -56088
  assert.strictEqual imul(123, -456), -56088
  assert.strictEqual imul(16~01234567, 16~fedcba98), 602016552
  sameValue imul(no 7), 0
  sameValue imul(7 no), 0
  sameValue imul(no no), 0
  assert.strictEqual imul(on 7), 7
  assert.strictEqual imul(7 on), 7
  assert.strictEqual imul(on on), 1
  sameValue imul(void 7), 0
  sameValue imul(7 void), 0
  sameValue imul(void void), 0
  sameValue imul(\str 7), 0
  sameValue imul(7 \str), 0
  sameValue imul({} 7), 0
  sameValue imul(7 {}), 0
  sameValue imul([] 7), 0
  sameValue imul(7 []), 0
  assert.strictEqual imul(0xffffffff, 5), -5
  assert.strictEqual imul(0xfffffffe, 5), -10
  assert.strictEqual imul(2 4), 8
  assert.strictEqual imul(-1 8), -8
  assert.strictEqual imul(-2 -2), 4
  sameValue imul(-0 7), 0
  sameValue imul(7 -0), 0
  sameValue imul(0.1 7), 0
  sameValue imul(7 0.1), 0
  sameValue imul(0.9 7), 0
  sameValue imul(7 0.9), 0
  assert.strictEqual imul(1.1 7), 7
  assert.strictEqual imul(7 1.1), 7
  assert.strictEqual imul(1.9 7), 7
  assert.strictEqual imul(7 1.9), 7