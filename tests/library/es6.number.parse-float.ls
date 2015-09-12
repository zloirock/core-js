{module, test} = QUnit
module \ES6

test 'Number.parseFloat' (assert)->
  assert.ok typeof! core.Number.parseFloat is \Function, 'is function'