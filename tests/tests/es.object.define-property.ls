{module, test} = QUnit
module \ES

test 'Object.defineProperty' (assert)->
  {defineProperty, create} = Object
  assert.isFunction defineProperty
  assert.arity defineProperty, 3
  assert.name defineProperty, \defineProperty
  assert.looksNative defineProperty
  assert.nonEnumerable Object, \defineProperty
  assert.ok (rez = defineProperty src = {}, \q, value: 42) is src
  assert.ok rez.q is 42
  assert.throws (!-> defineProperty 42 1 {})
  assert.throws (!-> defineProperty {} create(null), {})
  assert.throws (!-> defineProperty {} 1 1)