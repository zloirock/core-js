{module, test} = QUnit
module \ES

test 'Array#every' (assert)!->
  assert.isFunction Array::every
  assert.arity Array::every, 1
  assert.name Array::every, \every
  assert.looksNative Array::every
  assert.nonEnumerable Array::, \every
  (a = [1])every (val, key, that)!->
    assert.same &length, 3, 'correct number of callback arguments'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
    assert.same @, ctx, 'correct callback context'
  , ctx = {}
  assert.ok [1 2 3]every -> typeof! it is \Number
  assert.ok [1 2 3]every (<4)
  assert.ok not [1 2 3]every (<3)
  assert.ok not [1 2 3]every -> typeof! it is \String
  assert.ok [1 2 3]every (-> +@ is 1 ), 1
  rez = ''
  [1 2 3]every -> rez += &1
  assert.ok rez is \012
  assert.ok (arr = [1 2 3])every -> &2 is arr
  if STRICT
    assert.throws (!-> Array::every.call null, !->), TypeError
    assert.throws (!-> Array::every.call void, !->), TypeError
  if NATIVE
    assert.ok (try on is Array::every.call {length: -1, 0: 1}, !-> throw 42), 'uses ToLength'