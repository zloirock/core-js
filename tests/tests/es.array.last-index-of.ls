{module, test} = QUnit
module \ES

test 'Array#lastIndexOf' (assert)!->
  assert.isFunction Array::lastIndexOf
  assert.arity Array::lastIndexOf, 1
  assert.name Array::lastIndexOf, \lastIndexOf
  assert.looksNative Array::lastIndexOf
  assert.nonEnumerable Array::, \lastIndexOf
  assert.same 2,  [1 1 1]lastIndexOf 1
  assert.same -1, [1 2 3]lastIndexOf 3 1
  assert.same 1,  [1 2 3]lastIndexOf 2 1
  assert.same -1, [1 2 3]lastIndexOf 2 -3
  assert.same -1, [1 2 3]lastIndexOf 1 -4
  assert.same 1,  [1 2 3]lastIndexOf 2 -2
  assert.same -1, [NaN]lastIndexOf NaN
  assert.same 1,  [1 2 3]concat(Array 2)lastIndexOf 2
  assert.same 0,  [1].lastIndexOf(1, -0), "shouldn't return negative zero"
  if STRICT
    assert.throws (!-> Array::lastIndexOf.call null, 0), TypeError
    assert.throws (!-> Array::lastIndexOf.call void, 0), TypeError
  if NATIVE and DESCRIPTORS
    assert.ok (try -1 is Array::lastIndexOf.call Object.defineProperties({length: -1}, {2147483646: {get: -> throw Error!}, 4294967294: {get: -> throw Error!}}), 1), 'uses ToLength'