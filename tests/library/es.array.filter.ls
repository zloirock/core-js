{module, test} = QUnit
module \ES

test 'Array#filter' (assert)!->
  {filter} = core.Array
  assert.isFunction filter
  filter (a = [1]), (val, key, that)!->
    assert.same &length, 3, 'correct number of callback arguments'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
    assert.same @, ctx, 'correct callback context'
  , ctx = {}
  assert.deepEqual [1 2 3 4 5] filter [1 2 3 \q {} 4 on 5], -> typeof it is \number
  if STRICT
    assert.throws (!-> filter null, !->), TypeError
    assert.throws (!-> filter void, !->), TypeError