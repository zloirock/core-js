{module, test} = QUnit
module \ES6

test 'Number.parseInt' (assert)->
  assert.isFunction core.Number.parseInt