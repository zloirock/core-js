{module, test} = QUnit
module \ESNext

test 'WeakSet.from' (assert)!->
  {from} = WeakSet
  assert.isFunction from
  assert.arity from, 1
  assert.name from, \from
  assert.looksNative from
  assert.nonEnumerable WeakSet, \from
  assert.ok WeakSet.from! instanceof WeakSet
  $1 = []
  assert.ok WeakSet.from([$1]).has $1
  assert.ok WeakSet.from(createIterable [$1]).has $1
  element = void
  index = void
  context = void
  WeakSet.from [$$element = {}], ($element, $index)!->
    element := $element
    index := $index
    context := @
    return element
  , $context = {}
  assert.same element, $$element
  assert.same index, 0
  assert.same context, $context
  # generic
  assert.throws !-> from {}
  arg = void
  F = (it)-> arg := it
  from.call F, createIterable([1 2 3]), (-> it^2)
  assert.deepEqual arg, [1 4 9]
