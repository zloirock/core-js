{module, test} = QUnit
module \core-js

test 'core.getIterator' (assert)!->
  {getIterator} = core
  assert.isFunction getIterator
  assert.isIterator getIterator []
  assert.isIterator getIterator (->&)!
  assert.isIterator getIterator createIterable []
  assert.throws (!-> getIterator {}), TypeError