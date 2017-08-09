{module, test} = QUnit
module \ESNext

test 'Reflect.getOwnMetadataKeys' (assert)!->
  {defineMetadata, getOwnMetadataKeys} = Reflect
  {create} = Object
  assert.isFunction getOwnMetadataKeys
  assert.arity getOwnMetadataKeys, 1
  assert.name getOwnMetadataKeys, \getOwnMetadataKeys
  assert.looksNative getOwnMetadataKeys
  assert.nonEnumerable Reflect, \getOwnMetadataKeys
  assert.throws (!-> getOwnMetadataKeys void void), TypeError
  assert.deepEqual getOwnMetadataKeys({}, void), []
  obj = {}
  defineMetadata \key \value obj, void
  assert.deepEqual getOwnMetadataKeys(obj, void), <[key]>
  prototype = {};
  obj = create prototype
  defineMetadata \key \value prototype, void
  assert.deepEqual getOwnMetadataKeys(obj, void), []
  obj = {}
  defineMetadata \key0 \value obj, void
  defineMetadata \key1 \value obj, void
  assert.deepEqual getOwnMetadataKeys(obj, void), <[key0 key1]>
  obj = {}
  defineMetadata \key0 \value obj, void
  defineMetadata \key1 \value obj, void
  defineMetadata \key0 \value obj, void
  assert.deepEqual getOwnMetadataKeys(obj, void), <[key0 key1]>
  prototype = {}
  defineMetadata \key2 \value prototype, void
  obj = create prototype
  defineMetadata \key0 \value obj, void
  defineMetadata \key1 \value obj, void
  assert.deepEqual getOwnMetadataKeys(obj, void), <[key0 key1]>
  obj = {}
  assert.deepEqual getOwnMetadataKeys({}, \name), []
  obj = {}
  defineMetadata \key \value obj, \name
  assert.deepEqual getOwnMetadataKeys(obj, \name), <[key]>
  prototype = {}
  obj = create prototype
  defineMetadata \key \value prototype, \name
  assert.deepEqual getOwnMetadataKeys(obj, \name), []
  obj = {}
  defineMetadata \key0 \value obj, \name
  defineMetadata \key1 \value obj, \name
  defineMetadata \key0 \value obj, \name
  assert.deepEqual getOwnMetadataKeys(obj, \name), <[key0 key1]>
  prototype = {}
  defineMetadata \key2 \value prototype, \name
  obj = create prototype
  defineMetadata \key0 \value obj, \name
  defineMetadata \key1 \value obj, \name
  assert.deepEqual getOwnMetadataKeys(obj, \name), <[key0 key1]>