{module, test} = QUnit
module \ES

test 'Array#includes' (assert)!->
  assert.isFunction Array::includes
  assert.name Array::includes, \includes
  assert.arity Array::includes, 1
  assert.looksNative Array::includes
  assert.nonEnumerable Array::, \includes
  arr = [1 2 3 -0 o = {}]
  assert.ok arr.includes 1
  assert.ok arr.includes -0
  assert.ok arr.includes 0
  assert.ok arr.includes o
  assert.ok !arr.includes 4
  assert.ok !arr.includes -0.5
  assert.ok !arr.includes {}
  assert.ok Array(1)includes void
  assert.ok [NaN].includes(NaN)
  if STRICT
    assert.throws (!-> Array::includes.call null, 0), TypeError
    assert.throws (!-> Array::includes.call void, 0), TypeError
  if NATIVE and DESCRIPTORS
    assert.ok (try no is Array::includes.call Object.defineProperty({length: -1}, 0, get: -> throw Error!), 1), 'uses ToLength'
  assert.ok \includes of Array::[Symbol.unscopables], 'In Array#@@unscopables'