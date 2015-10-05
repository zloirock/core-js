{module, test} = QUnit
module \ES6

test 'Number.parseInt' (assert)->
  assert.isFunction Number.parseInt
  assert.name Number.parseInt, \parseInt
  assert.arity Number.parseInt, 2
  assert.looksNative Number.parseInt