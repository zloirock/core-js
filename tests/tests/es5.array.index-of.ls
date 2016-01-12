{module, test} = QUnit
module \ES5

test 'Array#indexOf' (assert)!->
  assert.isFunction Array::indexOf
  assert.arity Array::indexOf, 1
  assert.name Array::indexOf, \indexOf
  assert.looksNative Array::indexOf
  assert.ok 0  is [1 1 1]indexOf 1
  assert.ok -1 is [1 2 3]indexOf 1 1
  assert.ok 1  is [1 2 3]indexOf 2 1
  assert.ok -1 is [1 2 3]indexOf 2 -1
  assert.ok 1  is [1 2 3]indexOf 2 -2
  assert.ok -1 is [NaN]indexOf NaN
  assert.ok 3  is Array(2)concat([1 2 3])indexOf 2
  assert.ok -1 is Array(1)indexOf void
  if STRICT
    assert.throws (!-> Array::indexOf.call null, 0), TypeError
    assert.throws (!-> Array::indexOf.call void, 0), TypeError
  if NATIVE and DESCRIPTORS
    assert.ok (try -1 is Array::indexOf.call Object.defineProperty({length: -1}, 0, get: -> throw Error!), 1), 'uses ToLength'