{module, test} = QUnit
module \ESNext

test 'WeakMap.of' (assert)!->
  $of = WeakMap.of
  assert.isFunction $of
  assert.arity $of, 0
  assert.name $of, \of
  assert.looksNative $of
  assert.nonEnumerable WeakMap, \of
  $1 = []
  assert.ok WeakMap.of! instanceof WeakMap
  assert.same WeakMap.of([$1, 2]).get($1), 2
  # generic
  assert.throws !-> $of 1
  arg = void
  F = (it)-> arg := it
  $of.call F, 1 2 3
  assert.deepEqual arg, [1 2 3]
