{module, test} = QUnit
module \ES

test 'Array#sort' (assert)!->
  assert.isFunction Array::sort
  assert.arity Array::sort, 1
  assert.name Array::sort, \sort
  assert.looksNative Array::sort
  assert.nonEnumerable Array::, \sort
  assert.ok !!(try [1 2 3]sort void), 'works with undefined'
  assert.throws (!-> [1 2 3]sort null), 'throws on null'
  assert.throws (!-> [1 2 3]sort {}), 'throws on {}'
  if STRICT
    assert.throws (-> Array::sort.call null), TypeError, 'ToObject(this)'
    assert.throws (-> Array::sort.call void), TypeError, 'ToObject(this)'
  #if NATIVE => assert.ok !!(try Array::sort.call {0: 1, 1: 3, 2: 2, length: -1}, -> throw 42), 'ToLength(? Get(obj, "length"))'