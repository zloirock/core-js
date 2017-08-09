{module, test} = QUnit
module \ES

test 'Math.imul' (assert)!->
  {imul} = Math
  assert.isFunction imul
  assert.name imul, \imul
  assert.arity imul, 2
  assert.looksNative imul
  assert.nonEnumerable Math, \imul
  assert.same imul(0, 0), 0
  assert.strictEqual imul(123, 456), 56088
  assert.strictEqual imul(-123, 456), -56088
  assert.strictEqual imul(123, -456), -56088
  assert.strictEqual imul(16~01234567, 16~fedcba98), 602016552
  assert.same imul(no 7), 0
  assert.same imul(7 no), 0
  assert.same imul(no no), 0
  assert.strictEqual imul(on 7), 7
  assert.strictEqual imul(7 on), 7
  assert.strictEqual imul(on on), 1
  assert.same imul(void 7), 0
  assert.same imul(7 void), 0
  assert.same imul(void void), 0
  assert.same imul(\str 7), 0
  assert.same imul(7 \str), 0
  assert.same imul({} 7), 0
  assert.same imul(7 {}), 0
  assert.same imul([] 7), 0
  assert.same imul(7 []), 0
  assert.strictEqual imul(0xffffffff, 5), -5
  assert.strictEqual imul(0xfffffffe, 5), -10
  assert.strictEqual imul(2 4), 8
  assert.strictEqual imul(-1 8), -8
  assert.strictEqual imul(-2 -2), 4
  assert.same imul(-0 7), 0
  assert.same imul(7 -0), 0
  assert.same imul(0.1 7), 0
  assert.same imul(7 0.1), 0
  assert.same imul(0.9 7), 0
  assert.same imul(7 0.9), 0
  assert.strictEqual imul(1.1 7), 7
  assert.strictEqual imul(7 1.1), 7
  assert.strictEqual imul(1.9 7), 7
  assert.strictEqual imul(7 1.9), 7