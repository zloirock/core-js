{module, test} = QUnit
module 'ESNext'

test 'Math.clamp' (assert)!->
  {clamp} = core.Math
  assert.isFunction clamp
  assert.arity clamp, 3
  assert.same clamp(2, 4, 6), 4
  assert.same clamp(4, 2, 6), 4
  assert.same clamp(6, 2, 4), 4
