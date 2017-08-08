{module, test} = QUnit
module 'ESNext'

test 'Reflect.hasMetadata' (assert)!->
  {defineMetadata, hasMetadata} = Reflect
  {create} = Object
  assert.isFunction hasMetadata
  assert.arity hasMetadata, 2
  assert.name hasMetadata, \hasMetadata
  assert.looksNative hasMetadata
  assert.nonEnumerable Reflect, \hasMetadata
  assert.throws (!-> hasMetadata \key void void), TypeError
  assert.same hasMetadata(\key {}, void), no
  obj = {}
  defineMetadata \key \value obj, void
  assert.same hasMetadata(\key obj, void), on
  prototype = {}
  obj = create prototype
  defineMetadata \key \value prototype, void
  assert.same hasMetadata(\key obj, void), on
  assert.same hasMetadata(\key {}, \name), no
  obj = {}
  defineMetadata \key \value obj, \name
  assert.same hasMetadata(\key obj, \name), on
  prototype = {}
  obj = create prototype
  defineMetadata \key \value prototype, \name
  assert.same hasMetadata(\key obj, \name), on