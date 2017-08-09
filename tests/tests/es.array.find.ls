{module, test} = QUnit
module \ES

test 'Array#find' (assert)!->
  assert.isFunction Array::find
  assert.arity Array::find, 1
  assert.name Array::find, \find
  assert.looksNative Array::find
  assert.nonEnumerable Array::, \find
  (a = [1])find (val, key, that)!->
    assert.same &length, 3, 'correct number of callback arguments'
    assert.same val, 1, 'correct value in callback'
    assert.same key, 0, 'correct index in callback'
    assert.same that, a, 'correct link to array in callback'
    assert.same @, ctx, 'correct callback context'
  , ctx = {}
  assert.same [1 3 NaN, 42 {}]find((is 42)), 42
  assert.same [1 3 NaN, 42 {}]find((is 43)), void
  if STRICT
    assert.throws (-> Array::find.call null, 0), TypeError
    assert.throws (-> Array::find.call void, 0), TypeError
  if NATIVE and DESCRIPTORS
    assert.ok (try void is Array::find.call {length: -1, 0: 1}, !-> throw 42), 'uses ToLength'
  assert.ok \find of Array::[Symbol.unscopables], 'In Array#@@unscopables'