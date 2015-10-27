{module, test} = QUnit
module \core-js

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
  assert.strictEqual getIteratorMethod({}), void