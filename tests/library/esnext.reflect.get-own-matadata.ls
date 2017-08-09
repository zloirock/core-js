{module, test} = QUnit
module \ESNext

test 'Reflect.getOwnMetadata' (assert)!->
  {defineMetadata, getOwnMetadata} = core.Reflect
  {create} = core.Object
  assert.isFunction getOwnMetadata
  assert.arity getOwnMetadata, 2
  assert.throws (!-> getOwnMetadata \key void void), TypeError
  assert.same getOwnMetadata(\key {}, void), void
  obj = {}
  defineMetadata \key \value obj, void
  assert.same getOwnMetadata(\key obj, void), \value
  prototype = {}
  obj = create prototype
  defineMetadata \key \value prototype, void
  assert.same getOwnMetadata(\key obj, void), void
  assert.same getOwnMetadata(\key {}, \name), void
  obj = {}
  defineMetadata \key \value obj, \name
  assert.same getOwnMetadata(\key obj, \name), \value
  prototype = {}
  obj = create prototype
  defineMetadata \key \value prototype, \name
  assert.same getOwnMetadata(\key obj, \name), void