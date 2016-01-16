{module, test} = QUnit
module \ES5

test 'Object.defineProperty' (assert)->
  {defineProperty} = Object
  assert.isFunction defineProperty
  assert.arity defineProperty, 3
  assert.name defineProperty, \defineProperty
  assert.looksNative defineProperty
  assert.ok (rez = defineProperty src = {}, \q, value: 42) is src
  assert.ok rez.q is 42