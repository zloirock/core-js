{module, test} = QUnit
module \ES6

test 'Number.parseFloat' (assert)->
  assert.ok typeof! Number.parseFloat is \Function, 'Is function'
  assert.ok /native code/.test(Number.parseFloat), 'looks like native'