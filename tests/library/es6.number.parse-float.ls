{module, test} = QUnit
module \ES6

test 'Number.parseFloat' (assert)->
  assert.isFunction core.Number.parseFloat