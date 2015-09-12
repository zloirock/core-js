{module, test} = QUnit
module \ES6

test 'Array.of' (assert)->
  assert.ok typeof! Array.of is \Function, 'Is function'
  assert.strictEqual Array.of.length, 0, 'length is 0'
  assert.ok /native code/.test(Array.of), 'looks like native'
  assert.strictEqual Array.of.name, \of, 'name is "of"'
  assert.deepEqual Array.of(1), [1]
  assert.deepEqual Array.of(1 2 3), [1 2 3]
  # generic
  F = !->
  inst = Array.of.call F, 1, 2
  assert.ok inst instanceof F
  assert.strictEqual inst.0, 1
  assert.strictEqual inst.1, 2
  assert.strictEqual inst.length, 2