{module, test} = QUnit
module \ES

test 'Array#reduceRight' (assert)!->
  assert.isFunction Array::reduceRight
  assert.arity Array::reduceRight, 1
  assert.name Array::reduceRight, \reduceRight
  assert.looksNative Array::reduceRight
  assert.nonEnumerable Array::, \reduceRight
  (a = [1])reduceRight (memo, val, key, that)!->
    assert.same &length, 4, 'correct number of callback arguments'
    assert.same memo, accumulator, 'correct callback accumulator'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
  , accumulator = {}
  assert.same [1 2 3]reduceRight((+), 1), 7, 'works with initial accumulator'
  (a = [1 2])reduceRight (memo, val, key, that)!->
    assert.same memo, 2, 'correct default accumulator'
    assert.same val, 1, 'correct start value without initial accumulator'
    assert.same key, 0, 'correct start index without initial accumulator'
  assert.same [1 2 3]reduceRight((+)), 6, 'works without initial accumulator'
  v = ''
  k = ''
  [1 2 3]reduceRight (memo, a, b)!->
    v += a
    k += b
  , 0
  assert.same v, \321,'correct order #1'
  assert.same k, \210,'correct order #2'
  assert.same Array::reduceRight.call({0: 1, 1: 2, length: 2}, (+)), 3, 'generic'
  if STRICT
    assert.throws (!-> Array::reduceRight.call null, (!->), 1), TypeError
    assert.throws (!-> Array::reduceRight.call void, (!->), 1), TypeError
  if NATIVE
    assert.ok (try Array::reduceRight.call {length: -1, 2147483646: 0, 4294967294: 0}, (!-> throw 42), 1), 'uses ToLength'