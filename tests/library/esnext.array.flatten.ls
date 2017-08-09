{module, test} = QUnit
module \ESNext

test 'Array#flatten' (assert)!->
  {flatten} = core.Array
  assert.isFunction flatten
  assert.deepEqual flatten([]), []
  arr = [1, [2 3], [4, [5 6]]]
  assert.deepEqual flatten(arr, 0), arr
  assert.deepEqual flatten(arr, 1), [1 2 3 4, [5 6]]
  assert.deepEqual flatten(arr), [1 2 3 4, [5 6]]
  assert.deepEqual flatten(arr, 2), [1 2 3 4 5 6]
  assert.deepEqual flatten(arr, 3), [1 2 3 4 5 6]
  assert.deepEqual flatten(arr, -1), arr
  assert.deepEqual flatten(arr, Infinity), [1 2 3 4 5 6]
  if STRICT
    assert.throws (!-> flatten null, -> it), TypeError
    assert.throws (!-> flatten void, -> it), TypeError
  if NATIVE and DESCRIPTORS
    assert.ok (try no is flatten core.Object.defineProperty({length: -1}, 0, get: -> throw Error!), -> it), 'uses ToLength'
