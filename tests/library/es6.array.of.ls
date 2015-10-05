{module, test} = QUnit
module \ES6

test 'Array.of' (assert)->
  assert.isFunction core.Array.of
  assert.arity core.Array.of, 0
  assert.deepEqual core.Array.of(1), [1]
  assert.deepEqual core.Array.of(1 2 3), [1 2 3]
  # generic
  F = !->
  inst = core.Array.of.call F, 1, 2
  assert.ok inst instanceof F
  assert.strictEqual inst.0, 1
  assert.strictEqual inst.1, 2
  assert.strictEqual inst.length, 2