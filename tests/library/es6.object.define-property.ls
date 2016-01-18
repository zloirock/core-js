{module, test} = QUnit
module \ES6

test 'Object.defineProperty' (assert)!->
  {defineProperty} = core.Object
  assert.isFunction defineProperty
  assert.arity defineProperty, 3
  assert.ok (rez = defineProperty src = {}, \q, value: 42) is src
  assert.ok rez.q is 42