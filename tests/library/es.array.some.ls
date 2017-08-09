{module, test} = QUnit
module \ES

test 'Array#some' (assert)!->
  {some} = core.Array
  assert.isFunction some
  some (a = [1]), (val, key, that)!->
    assert.same &length, 3, 'correct number of callback arguments'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
    assert.same @, ctx, 'correct callback context'
  , ctx = {}
  assert.ok some [1 \2 3], -> typeof! it is \Number
  assert.ok some [1 2 3], (<3)
  assert.ok not some [1 2 3], (<0)
  assert.ok not some [1 2 3], -> typeof! it is \String
  assert.ok not some [1 2 3], (-> +@ isnt 1), 1
  rez = ''
  some [1 2 3], -> rez += &1; no
  assert.ok rez is \012
  assert.ok not some (arr = [1 2 3]), -> &2 isnt arr
  if STRICT
    assert.throws (!-> some null, !->), TypeError
    assert.throws (!-> some void, !->), TypeError