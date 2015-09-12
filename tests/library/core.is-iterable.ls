{module, test} = QUnit
module \core-js

{values} = core.Array

test 'core.isIterable' (assert)->
  {isIterable} = core
  assert.ok typeof isIterable is \function, 'is function'
  assert.ok !isIterable {}
  assert.ok isIterable []
  assert.ok isIterable (->&)!