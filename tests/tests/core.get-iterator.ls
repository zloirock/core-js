{module, test} = QUnit
module \core-js

{from} = Array

test 'core.getIterator' (assert)->
  {getIterator} = core
  assert.ok typeof getIterator is \function, 'Is function'
  assert.throws (!-> getIterator {}), TypeError
  iter = getIterator []
  assert.ok \next of iter
  iter = getIterator (->&)!
  assert.ok \next of iter