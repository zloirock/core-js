{module, test} = QUnit
module \ES6

test 'Number.parseFloat' (assert)->
  assert.ok typeof! Number.parseFloat is \Function, 'is function'
  assert.strictEqual Number.parseFloat.name, \parseFloat, 'name is "parseFloat"'
  assert.strictEqual Number.parseFloat.length, 1, 'arity is 1'
  assert.ok /native code/.test(Number.parseFloat), 'looks like native'