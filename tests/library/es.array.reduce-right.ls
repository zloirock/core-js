{module, test} = QUnit
module \ES

test 'Array#reduceRight' (assert)!->
  {reduceRight} = core.Array
  assert.isFunction reduceRight
  reduceRight (a = [1]), (memo, val, key, that)!->
    assert.same &length, 4, 'correct number of callback arguments'
    assert.same memo, accumulator, 'correct callback accumulator'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
  , accumulator = {}
  assert.same reduceRight([1 2 3], (+), 1), 7, 'works with initial accumulator'
  reduceRight (a = [1 2]), (memo, val, key, that)!->
    assert.same memo, 2, 'correct default accumulator'
    assert.same val, 1, 'correct start value without initial accumulator'
    assert.same key, 0, 'correct start index without initial accumulator'
  assert.same reduceRight([1 2 3], (+)), 6, 'works without initial accumulator'
  v = ''
  k = ''
  reduceRight [1 2 3], (memo, a, b)!->
    v += a
    k += b
  , 0
  assert.same v, \321,'correct order #1'
  assert.same k, \210,'correct order #2'
  assert.same reduceRight({0: 1, 1: 2, length: 2}, (+)), 3, 'generic'
  if STRICT
    assert.throws (!-> reduceRight null, (!->), 1), TypeError
    assert.throws (!-> reduceRight void, (!->), 1), TypeError