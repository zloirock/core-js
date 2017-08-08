{module, test} = QUnit
module 'ESNext'

test 'WeakSet.of' (assert)!->
  $of = WeakSet.of
  assert.isFunction $of
  assert.arity $of, 0
  assert.name $of, \of
  assert.looksNative $of
  assert.nonEnumerable WeakSet, \of
  $1 = []
  assert.ok WeakSet.of! instanceof WeakSet
  assert.ok WeakSet.of($1).has $1
  # generic
  assert.throws !-> $of 1
  arg = void
  F = (it)-> arg := it
  $of.call F, 1 2 3
  assert.deepEqual arg, [1 2 3]
