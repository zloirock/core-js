{module, test} = QUnit
module \ES

test 'Array#map' (assert)!->
  assert.isFunction Array::map
  assert.arity Array::map, 1
  assert.name Array::map, \map
  assert.looksNative Array::map
  assert.nonEnumerable Array::, \map
  (a = [1])map (val, key, that)!->
    assert.same &length, 3, 'correct number of callback arguments'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
    assert.same @, ctx, 'correct callback context'
  , ctx = {}
  assert.deepEqual [2 3 4] [1 2 3]map (+ 1)
  assert.deepEqual [1 3 5] [1 2 3]map ( + )
  assert.deepEqual [2 2 2] [1 2 3]map (-> +@), 2
  if STRICT
    assert.throws (!-> Array::map.call null, !->), TypeError
    assert.throws (!-> Array::map.call void, !->), TypeError
  if NATIVE
    assert.ok (try Array::map.call {length: -1, 0: 1}, !-> throw 42), 'uses ToLength'