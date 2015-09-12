{module, test} = QUnit
module \ES6

test 'Number.parseInt' (assert)->
  assert.ok typeof! core.Number.parseInt is \Function, 'is function'