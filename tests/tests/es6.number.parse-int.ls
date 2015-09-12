{module, test} = QUnit
module \ES6

test 'Number.parseInt' (assert)->
  assert.ok typeof! Number.parseInt is \Function, 'Is function'
  assert.ok /native code/.test(Number.parseInt), 'looks like native'