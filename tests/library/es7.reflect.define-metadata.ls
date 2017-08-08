{module, test} = QUnit
module 'ESNext'

test 'Reflect.defineMetadata' (assert)!->
  {defineMetadata} = core.Reflect
  assert.isFunction defineMetadata
  assert.arity defineMetadata, 4
  assert.throws (!-> defineMetadata \key \value void void), TypeError
  assert.same defineMetadata(\key \value {}, void), void
  assert.same defineMetadata(\key \value {}, \name), void