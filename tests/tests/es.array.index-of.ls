{module, test} = QUnit
module \ES

test 'Array#indexOf' (assert)!->
  assert.isFunction Array::indexOf
  assert.arity Array::indexOf, 1
  assert.name Array::indexOf, \indexOf
  assert.looksNative Array::indexOf
  assert.nonEnumerable Array::, \indexOf
  assert.same 0,  [1 1 1]indexOf 1
  assert.same -1, [1 2 3]indexOf 1 1
  assert.same 1,  [1 2 3]indexOf 2 1
  assert.same -1, [1 2 3]indexOf 2 -1
  assert.same 1,  [1 2 3]indexOf 2 -2
  assert.same -1, [NaN]indexOf NaN
  assert.same 3,  Array(2)concat([1 2 3])indexOf 2
  assert.same -1, Array(1)indexOf void
  assert.same 0,  [1].indexOf(1, -0), "shouldn't return negative zero"
  if STRICT
    assert.throws (!-> Array::indexOf.call null, 0), TypeError
    assert.throws (!-> Array::indexOf.call void, 0), TypeError
  if NATIVE and DESCRIPTORS
    assert.ok (try -1 is Array::indexOf.call Object.defineProperty({length: -1}, 0, get: -> throw Error!), 1), 'uses ToLength'