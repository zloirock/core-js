{module, test} = QUnit
module \ESNext

test 'Array#flatten' (assert)!->
  assert.isFunction Array::flatten
  assert.name Array::flatten, \flatten
  assert.arity Array::flatten, 0
  assert.looksNative Array::flatten
  assert.nonEnumerable Array::, \flatten
  assert.deepEqual []flatten!, []
  arr = [1, [2 3], [4, [5 6]]]
  assert.deepEqual arr.flatten(0), arr
  assert.deepEqual arr.flatten(1), [1 2 3 4, [5 6]]
  assert.deepEqual arr.flatten!, [1 2 3 4, [5 6]]
  assert.deepEqual arr.flatten(2), [1 2 3 4 5 6]
  assert.deepEqual arr.flatten(3), [1 2 3 4 5 6]
  assert.deepEqual arr.flatten(-1), arr
  assert.deepEqual arr.flatten(Infinity), [1 2 3 4 5 6]
  if STRICT
    assert.throws (!-> Array::flatten.call null, -> it), TypeError
    assert.throws (!-> Array::flatten.call void, -> it), TypeError
  if NATIVE and DESCRIPTORS
    assert.ok (try no is Array::flatten.call Object.defineProperty({length: -1}, 0, get: -> throw Error!), -> it), 'uses ToLength'
  assert.ok \flatten of Array::[Symbol.unscopables], 'In Array#@@unscopables'
