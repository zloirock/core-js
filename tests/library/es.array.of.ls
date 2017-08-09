{module, test} = QUnit
module \ES

test 'Array.of' (assert)!->
  {Array} = core
  {defineProperty} = core.Object
  assert.isFunction Array.of
  assert.arity Array.of, 0
  assert.deepEqual Array.of(1), [1]
  assert.deepEqual Array.of(1 2 3), [1 2 3]
  # generic
  F = !->
  inst = Array.of.call F, 1, 2
  assert.ok inst instanceof F
  assert.strictEqual inst.0, 1
  assert.strictEqual inst.1, 2
  assert.strictEqual inst.length, 2
  if DESCRIPTORS
    called = no
    F = !->
    defineProperty F::, 0, set: !-> called = on
    Array.of.call F, 1, 2, 3
    assert.ok !called, 'Should not call prototype accessors'