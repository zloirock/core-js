{module, test} = QUnit
module \ES

test 'Array#reduce' (assert)!->
  assert.isFunction Array::reduce
  assert.arity Array::reduce, 1
  assert.name Array::reduce, \reduce
  assert.looksNative Array::reduce
  assert.nonEnumerable Array::, \reduce
  (a = [1])reduce (memo, val, key, that)!->
    assert.same &length, 4, 'correct number of callback arguments'
    assert.same memo, accumulator, 'correct callback accumulator'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
  , accumulator = {}
  assert.same [1 2 3]reduce((+), 1), 7, 'works with initial accumulator'
  (a = [1 2])reduce (memo, val, key, that)!->
    assert.same memo, 1, 'correct default accumulator'
    assert.same val, 2, 'correct start value without initial accumulator'
    assert.same key, 1, 'correct start index without initial accumulator'
  assert.same [1 2 3]reduce((+)), 6, 'works without initial accumulator'
  v = ''
  k = ''
  [1 2 3]reduce (memo, a, b)!->
    v += a
    k += b
  , 0
  assert.same v, \123,'correct order #1'
  assert.same k, \012,'correct order #2'
  assert.same Array::reduce.call({0: 1, 1: 2, length: 2}, (+)), 3, 'generic'
  if STRICT
    assert.throws (!-> Array::reduce.call null, (!->), 1), TypeError
    assert.throws (!-> Array::reduce.call void, (!->), 1), TypeError
  if NATIVE
    assert.ok (try Array::reduce.call {length: -1, 0: 1}, (!-> throw 42), 1), 'uses ToLength'