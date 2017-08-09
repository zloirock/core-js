{module, test} = QUnit
module \ES

test 'Array#findIndex' (assert)!->
  assert.isFunction Array::findIndex
  assert.arity Array::findIndex, 1
  assert.name Array::findIndex, \findIndex
  assert.looksNative Array::findIndex
  assert.nonEnumerable Array::, \findIndex
  (a = [1])findIndex (val, key, that)!->
    assert.same &length, 3, 'correct number of callback arguments'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
    assert.same @, ctx, 'correct callback context'
  , ctx = {}
  assert.same [1 3 NaN, 42 {}]findIndex((is 42)), 3
  assert.same [1 3 NaN, 42 {}]findIndex((is 43)), -1
  if STRICT
    assert.throws (-> Array::findIndex.call null, 0), TypeError
    assert.throws (-> Array::findIndex.call void, 0), TypeError
  if NATIVE and DESCRIPTORS
    assert.ok (try -1 is Array::findIndex.call {length: -1, 0: 1}, !-> throw 42), 'uses ToLength'
  assert.ok \findIndex of Array::[Symbol.unscopables], 'In Array#@@unscopables'