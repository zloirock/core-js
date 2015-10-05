{module, test} = QUnit
module \core-js

{values} = core.Array

test 'core.isIterable' (assert)->
  {isIterable} = core
  assert.isFunction isIterable
  assert.ok !isIterable {}
  assert.ok isIterable []
  assert.ok isIterable (->&)!