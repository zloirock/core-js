{module, test} = QUnit
module \ESNext

test 'global' (assert)!->
  assert.same global, Object(global), 'is object'
  assert.same global.Math, Math, 'contains globals'