{module, test} = QUnit
module \ES6

test 'Number.parseInt' (assert)->
  assert.ok typeof! Number.parseInt is \Function, 'is function'
  assert.strictEqual Number.parseInt.name, \parseInt, 'name is "parseInt"'
  assert.strictEqual Number.parseInt.length, 2, 'arity is 2'
  assert.ok /native code/.test(Number.parseInt), 'looks like native'