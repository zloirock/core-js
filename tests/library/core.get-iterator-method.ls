{module, test} = QUnit
module \core-js

{from, values} = core.Array

test 'core.getIteratorMethod' (assert)->
  {getIteratorMethod} = core
  assert.ok typeof getIteratorMethod is \function, 'is function'
  assert.strictEqual getIteratorMethod({}), void
  iterFn = getIteratorMethod []
  assert.ok typeof iterFn is \function
  iter = iterFn.call []
  assert.ok \next of iter
  iter = getIteratorMethod (->&)!
  assert.ok typeof iterFn is \function