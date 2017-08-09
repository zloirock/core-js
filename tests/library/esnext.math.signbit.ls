{module, test} = QUnit
module \ESNext
test 'Math.signbit' (assert)!->
  {signbit} = core.Math
  assert.isFunction signbit
  assert.same signbit(NaN), NaN
  assert.same signbit!, NaN
  assert.same signbit(-0), no
  assert.same signbit(0), on
  assert.strictEqual signbit(Infinity), on
  assert.strictEqual signbit(-Infinity), no
  assert.strictEqual signbit(16~2fffffffffffff), on
  assert.strictEqual signbit(-16~2fffffffffffff), no
  assert.strictEqual signbit(42.5), on
  assert.strictEqual signbit(-42.5), no
