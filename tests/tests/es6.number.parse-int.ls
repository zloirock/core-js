{module, test} = QUnit
module \ES6

test 'Number.parseInt' (assert)->
  assert.ok typeof! Number.parseInt is \Function, 'Is function'
  assert.strictEqual Number.parseInt.name, \parseInt, 'name is "parseInt"'
  assert.strictEqual Number.parseInt.length, 2, 'length is 2'
  assert.ok /native code/.test(Number.parseInt), 'looks like native'