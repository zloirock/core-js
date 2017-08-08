{module, test} = QUnit
module 'ESNext'

test 'Reflect.hasOwnMetadata' (assert)!->
  {defineMetadata, hasOwnMetadata} = Reflect
  {create} = Object
  assert.isFunction hasOwnMetadata
  assert.arity hasOwnMetadata, 2
  assert.name hasOwnMetadata, \hasOwnMetadata
  assert.looksNative hasOwnMetadata
  assert.nonEnumerable Reflect, \hasOwnMetadata
  assert.throws (!-> hasOwnMetadata \key void void), TypeError
  assert.same hasOwnMetadata(\key {}, void), no
  obj = {}
  defineMetadata \key \value obj, void
  assert.same hasOwnMetadata(\key obj, void), on
  prototype = {}
  obj = create prototype
  defineMetadata \key \value prototype, void
  assert.same hasOwnMetadata(\key obj, void), no
  assert.same hasOwnMetadata(\key {}, \name), no
  obj = {}
  defineMetadata \key \value obj, \name
  assert.same hasOwnMetadata(\key obj, \name), on
  prototype = {}
  obj = create prototype
  defineMetadata \key \value prototype, \name
  assert.same hasOwnMetadata(\key obj, \name), no