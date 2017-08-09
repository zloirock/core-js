{module, test} = QUnit
module \ESNext

test 'Reflect.deleteMetadata' (assert)!->
  {defineMetadata, hasOwnMetadata, deleteMetadata} = Reflect
  {create} = Object
  assert.isFunction deleteMetadata
  assert.arity deleteMetadata, 2
  assert.name deleteMetadata, \deleteMetadata
  assert.looksNative deleteMetadata
  assert.nonEnumerable Reflect, \deleteMetadata
  assert.throws (!-> deleteMetadata \key void void), TypeError
  assert.same deleteMetadata(\key {}, void), no
  obj = {}
  defineMetadata \key \value obj, void
  assert.same deleteMetadata(\key obj, void), on
  prototype = {}
  defineMetadata \key \value prototype, void
  assert.same deleteMetadata(\key create(prototype), void), no
  obj = {}
  defineMetadata \key \value obj, void
  deleteMetadata \key obj, void
  assert.same hasOwnMetadata("key", obj, undefined), no