{module, test} = QUnit
module \core-js

{from, values} = core.Array

test 'core.getIterator' (assert)->
  {getIterator} = core
  assert.isFunction getIterator
  assert.throws (!-> getIterator {}), TypeError
  iter = getIterator []
  assert.ok \next of iter
  iter = getIterator (->&)!
  assert.ok \next of iter