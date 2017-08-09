{module, test} = QUnit
module \ES

test 'Array#forEach' (assert)!->
  {forEach} = core.Array
  assert.isFunction forEach
  forEach (a = [1]), (val, key, that)!->
    assert.same &length, 3, 'correct number of callback arguments'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
    assert.same @, ctx, 'correct callback context'
  , ctx = {}
  rez = ''
  forEach [1 2 3], !-> rez += it
  assert.ok rez is \123
  rez = ''
  forEach [1 2 3], !-> rez += &1
  assert.ok rez is \012
  rez = ''
  forEach [1 2 3], !-> rez += &2
  assert.ok rez is '1,2,31,2,31,2,3'
  rez=''
  forEach [1 2 3], (!->rez+=@), 1
  assert.ok rez is \111
  rez = ''
  arr = []
  arr.5 = ''
  forEach arr, (, k)!-> rez += k
  assert.ok rez is \5
  if STRICT
    assert.throws (!-> forEach null, !->), TypeError
    assert.throws (!-> forEach void, !->), TypeError