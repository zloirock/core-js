{module, test} = QUnit
module 'ESNext'

test 'Map.from' (assert)!->
  {from} = Map
  assert.isFunction from
  assert.arity from, 1
  assert.name from, \from
  assert.looksNative from
  assert.nonEnumerable Map, \from
  assert.ok Map.from! instanceof Map
  assert.deepEqual Array.from(Map.from([])), []
  assert.deepEqual Array.from(Map.from([[1 2]])), [[1 2]]
  assert.deepEqual Array.from(Map.from([[1 2], [2 3], [1 4]])), [[1 4], [2 3]]
  assert.deepEqual Array.from(Map.from(createIterable [[1 2], [2 3], [1 4]])), [[1 4], [2 3]]
  element = void
  index = void
  context = void
  Map.from [$$element = [1 2]], ($element, $index)!->
    element := $element
    index := $index
    context := @
    return element
  , $context = {}
  assert.same element, $$element
  assert.same index, 0
  assert.same context, $context
  # generic
  assert.throws !-> from [1 2]
  arg = void
  F = (it)-> arg := it
  from.call F, createIterable([1 2 3]), (-> it^2)
  assert.deepEqual arg, [1 4 9]
