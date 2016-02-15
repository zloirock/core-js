{module, test} = QUnit
module \ES7

test 'Math.umulh' (assert)!->
  {umulh} = core.Math
  assert.isFunction umulh
  assert.arity umulh, 2
  assert.same umulh(0xffffffff 7), 6
  assert.same umulh(0xfffffff 77), 4
  assert.same umulh(1 7), 0
  assert.same umulh(-1 7), 6