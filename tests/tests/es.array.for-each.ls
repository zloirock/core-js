{module, test} = QUnit
module \ES

test 'Array#forEach' (assert)!->
  assert.isFunction Array::forEach
  assert.arity Array::forEach, 1
  assert.name Array::forEach, \forEach
  assert.looksNative Array::forEach
  assert.nonEnumerable Array::, \forEach
  (a = [1])forEach (val, key, that)!->
    assert.same &length, 3, 'correct number of callback arguments'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
    assert.same @, ctx, 'correct callback context'
  , ctx = {}
  rez = ''
  [1 2 3]forEach !-> rez += it
  assert.ok rez is \123
  rez = ''
  [1 2 3]forEach !-> rez += &1
  assert.ok rez is \012
  rez = ''
  [1 2 3]forEach !-> rez += &2
  assert.ok rez is '1,2,31,2,31,2,3'
  rez=''
  [1 2 3]forEach (!->rez+=@), 1
  assert.ok rez is \111
  rez = ''
  arr = []
  arr.5 = ''
  arr.forEach (, k)!-> rez += k
  assert.ok rez is \5
  if STRICT
    assert.throws (!-> Array::forEach.call null, !->), TypeError
    assert.throws (!-> Array::forEach.call void, !->), TypeError
  if NATIVE
    assert.ok (try void is Array::forEach.call {length: -1, 0: 1}, !-> throw 42), 'uses ToLength'