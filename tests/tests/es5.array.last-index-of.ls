{module, test} = QUnit
module \ES5

test 'Array#lastIndexOf' (assert)->
  assert.isFunction Array::lastIndexOf
  assert.arity Array::lastIndexOf, 1
  assert.name Array::lastIndexOf, \lastIndexOf
  assert.looksNative Array::lastIndexOf
  assert.strictEqual 2,  [1 1 1]lastIndexOf 1
  assert.strictEqual -1, [1 2 3]lastIndexOf 3 1
  assert.strictEqual 1,  [1 2 3]lastIndexOf 2 1
  assert.strictEqual -1, [1 2 3]lastIndexOf 2 -3
  assert.strictEqual 1,  [1 2 3]lastIndexOf 2 -2
  assert.strictEqual -1, [NaN]lastIndexOf NaN
  assert.strictEqual 1,  [1 2 3]concat(Array 2)lastIndexOf 2
  if STRICT
    assert.throws (!-> Array::lastIndexOf.call null, 0), TypeError
    assert.throws (!-> Array::lastIndexOf.call void, 0), TypeError
  if NATIVE and DESCRIPTORS
    assert.ok (try -1 is Array::lastIndexOf.call Object.defineProperties({length: -1}, {2147483646: {get: -> throw Error!}, 4294967294: {get: -> throw Error!}}), 1), 'uses ToLength'