{module, test} = QUnit
module \ES

test 'Array#map' (assert)!->
  {map} = core.Array
  assert.isFunction map
  map (a = [1]), (val, key, that)->
    assert.same &length, 3, 'correct number of callback arguments'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
    assert.same @, ctx, 'correct callback context'
  , ctx = {}
  assert.deepEqual [2 3 4] map [1 2 3], (+ 1)
  assert.deepEqual [1 3 5] map [1 2 3], ( + )
  assert.deepEqual [2 2 2] map [1 2 3], (-> +@), 2
  if STRICT
    assert.throws (!-> map null, !->), TypeError
    assert.throws (!-> map void, !->), TypeError