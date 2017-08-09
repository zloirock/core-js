{module, test} = QUnit
module \ES

test 'Array#some' (assert)!->
  assert.isFunction Array::some
  assert.arity Array::some, 1
  assert.name Array::some, \some
  assert.looksNative Array::some
  assert.nonEnumerable Array::, \some
  (a = [1])some (val, key, that)!->
    assert.same &length, 3, 'correct number of callback arguments'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
    assert.same @, ctx, 'correct callback context'
  , ctx = {}
  assert.ok [1 \2 3]some -> typeof! it is \Number
  assert.ok [1 2 3]some (<3)
  assert.ok not [1 2 3]some (<0)
  assert.ok not [1 2 3]some -> typeof! it is \String
  assert.ok not [1 2 3]some (-> +@ isnt 1), 1
  rez = ''
  [1 2 3]some -> rez += &1; no
  assert.ok rez is \012
  assert.ok not (arr = [1 2 3])some -> &2 isnt arr
  if STRICT
    assert.throws (!-> Array::some.call null, !->), TypeError
    assert.throws (!-> Array::some.call void, !->), TypeError
  if NATIVE
    assert.ok (try no is Array::some.call {length: -1, 0: 1}, !-> throw 42), 'uses ToLength'