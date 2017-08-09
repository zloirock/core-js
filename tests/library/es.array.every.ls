{module, test} = QUnit
module \ES

test 'Array#every' (assert)!->
  {every} = core.Array
  assert.isFunction every
  every (a = [1]), (val, key, that)!->
    assert.same &length, 3, 'correct number of callback arguments'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
    assert.same @, ctx, 'correct callback context'
  , ctx = {}
  assert.ok every [1 2 3], -> typeof! it is \Number
  assert.ok every [1 2 3], (<4)
  assert.ok not every [1 2 3], (<3)
  assert.ok not every [1 2 3], -> typeof! it is \String
  assert.ok every [1 2 3], (-> +@ is 1 ), 1
  rez = ''
  every [1 2 3], -> rez += &1
  assert.ok rez is \012
  assert.ok every (arr = [1 2 3]), -> &2 is arr
  if STRICT
    assert.throws (!-> every null, !->), TypeError
    assert.throws (!-> every void, !->), TypeError