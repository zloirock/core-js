{module, test} = QUnit
module \ESNext

test 'WeakMap.of' (assert)!->
  {WeakMap} = core
  $of = WeakMap.of
  assert.isFunction $of
  assert.arity $of, 0
  $1 = []
  assert.ok WeakMap.of! instanceof WeakMap
  assert.same WeakMap.of([$1, 2]).get($1), 2
  # generic
  assert.throws !-> $of 1
  arg = void
  F = (it)-> arg := it
  $of.call F, 1 2 3
  assert.deepEqual arg, [1 2 3]
