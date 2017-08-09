{module, test} = QUnit
module \ES

test 'Array#filter' (assert)!->
  assert.isFunction Array::filter
  assert.arity Array::filter, 1
  assert.name Array::filter, \filter
  assert.looksNative Array::filter
  assert.nonEnumerable Array::, \filter
  (a = [1])filter (val, key, that)!->
    assert.same &length, 3, 'correct number of callback arguments'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
    assert.same @, ctx, 'correct callback context'
  , ctx = {}
  assert.deepEqual [1 2 3 4 5] [1 2 3 \q {} 4 on 5]filter -> typeof it is \number
  if STRICT
    assert.throws (!-> Array::filter.call null, !->), TypeError
    assert.throws (!-> Array::filter.call void, !->), TypeError
  if NATIVE
    assert.ok (try Array::filter.call {length: -1, 0: 1}, !-> throw 42), 'uses ToLength'