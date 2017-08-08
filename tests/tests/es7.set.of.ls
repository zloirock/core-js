{module, test} = QUnit
module 'ESNext'

test 'Set.of' (assert)!->
  $of = Set.of
  assert.isFunction $of
  assert.arity $of, 0
  assert.name $of, \of
  assert.looksNative $of
  assert.nonEnumerable Set, \of
  assert.ok Set.of! instanceof Set
  assert.deepEqual Array.from(Set.of(1)), [1]
  assert.deepEqual Array.from(Set.of(1 2 3 2 1)), [1 2 3]
  # generic
  assert.throws !-> $of 1
  arg = void
  F = (it)-> arg := it
  $of.call F, 1 2 3
  assert.deepEqual arg, [1 2 3]
