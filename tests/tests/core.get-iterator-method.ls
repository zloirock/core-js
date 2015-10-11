{module, test} = QUnit
module \core-js

{from} = Array

test 'core.getIteratorMethod' (assert)!->
  {getIteratorMethod} = core
  assert.isFunction getIteratorMethod
  iterable = createIterable []
  iterFn = getIteratorMethod iterable
  assert.isFunction iterFn
  assert.isIterator iterFn.call iterable
  assert.isFunction getIteratorMethod []
  assert.isFunction getIteratorMethod (->&)!
  assert.isFunction getIteratorMethod Array::
  assert.isFunction getIteratorMethod String::
  assert.strictEqual getIteratorMethod({}), void