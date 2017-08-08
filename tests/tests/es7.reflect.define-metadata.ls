{module, test} = QUnit
module 'ESNext'

test 'Reflect.defineMetadata' (assert)!->
  {defineMetadata} = Reflect
  assert.isFunction defineMetadata
  assert.arity defineMetadata, 4
  assert.name defineMetadata, \defineMetadata
  assert.looksNative defineMetadata
  assert.nonEnumerable Reflect, \defineMetadata
  assert.throws (!-> defineMetadata \key \value void void), TypeError
  assert.same defineMetadata(\key \value {}, void), void
  assert.same defineMetadata(\key \value {}, \name), void