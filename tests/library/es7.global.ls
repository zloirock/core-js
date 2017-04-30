{module, test} = QUnit
module \ES7

test 'global' (assert)!->
  global = core.global
  assert.same global, Object(global), 'is object'
  assert.same global.Math, Math, 'contains globals'