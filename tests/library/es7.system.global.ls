{module, test} = QUnit
module \ES7

test 'System.global' (assert)!->
  global = core.System.global
  assert.same global, Object(global), 'is object'
  assert.same global.Math, Math, 'contains globals'