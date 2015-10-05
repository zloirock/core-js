{module, test} = QUnit
module \ES6

test 'Number.parseFloat' (assert)->
  assert.isFunction Number.parseFloat
  assert.name Number.parseFloat, \parseFloat
  assert.arity Number.parseFloat, 1
  assert.looksNative Number.parseFloat