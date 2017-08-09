{module, test} = QUnit
module \ESNext

test 'Map.of' (assert)!->
  $of = Map.of
  assert.isFunction $of
  assert.arity $of, 0
  assert.name $of, \of
  assert.looksNative $of
  assert.nonEnumerable Map, \of
  assert.ok Map.of! instanceof Map
  assert.deepEqual Array.from(Map.of([1 2])), [[1 2]]
  assert.deepEqual Array.from(Map.of([1 2], [2 3], [1 4])), [[1 4], [2 3]]
  # generic
  assert.throws !-> $of 1
  arg = void
  F = (it)-> arg := it
  $of.call F, 1 2 3
  assert.deepEqual arg, [1 2 3]
