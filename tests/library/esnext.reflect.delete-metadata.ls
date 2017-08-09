{module, test} = QUnit
module \ESNext

test 'Reflect.deleteMetadata' (assert)!->
  {defineMetadata, hasOwnMetadata, deleteMetadata} = core.Reflect
  {create} = core.Object
  assert.isFunction deleteMetadata
  assert.arity deleteMetadata, 2
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