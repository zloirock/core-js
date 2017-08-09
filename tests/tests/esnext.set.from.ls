{module, test} = QUnit
module \ESNext

test 'Set.from' (assert)!->
  {from} = Set
  assert.isFunction from
  assert.arity from, 1
  assert.name from, \from
  assert.looksNative from
  assert.nonEnumerable Set, \from
  assert.ok Set.from! instanceof Set
  assert.deepEqual Array.from(Set.from([])), []
  assert.deepEqual Array.from(Set.from([1])), [1]
  assert.deepEqual Array.from(Set.from([1 2 3 2 1])), [1 2 3]
  assert.deepEqual Array.from(Set.from(createIterable [1 2 3 2 1])), [1 2 3]
  element = void
  index = void
  context = void
  Set.from [1], ($element, $index)!->
    element := $element
    index := $index
    context := @
    return element
  , $context = {}
  assert.same element, 1
  assert.same index, 0
  assert.same context, $context
  # generic
  assert.throws !-> from 1
  arg = void
  F = (it)-> arg := it
  from.call F, createIterable([1 2 3]), (-> it^2)
  assert.deepEqual arg, [1 4 9]
