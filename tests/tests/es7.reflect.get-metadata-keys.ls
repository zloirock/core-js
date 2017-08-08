{module, test} = QUnit
module 'ESNext'

test 'Reflect.getMetadataKeys' (assert)!->
  {defineMetadata, getMetadataKeys} = Reflect
  {create} = Object
  assert.isFunction getMetadataKeys
  assert.arity getMetadataKeys, 1
  assert.name getMetadataKeys, \getMetadataKeys
  assert.looksNative getMetadataKeys
  assert.nonEnumerable Reflect, \getMetadataKeys
  assert.throws (!-> getMetadataKeys void void), TypeError
  assert.deepEqual getMetadataKeys({}, void), []
  obj = {}
  defineMetadata \key \value obj, void
  assert.deepEqual getMetadataKeys(obj, void), <[key]>
  prototype = {};
  obj = create prototype
  defineMetadata \key \value prototype, void
  assert.deepEqual getMetadataKeys(obj, void), <[key]>
  obj = {}
  defineMetadata \key0 \value obj, void
  defineMetadata \key1 \value obj, void
  assert.deepEqual getMetadataKeys(obj, void), <[key0 key1]>
  obj = {}
  defineMetadata \key0 \value obj, void
  defineMetadata \key1 \value obj, void
  defineMetadata \key0 \value obj, void
  assert.deepEqual getMetadataKeys(obj, void), <[key0 key1]>
  prototype = {}
  defineMetadata \key2 \value prototype, void
  obj = create prototype
  defineMetadata \key0 \value obj, void
  defineMetadata \key1 \value obj, void
  assert.deepEqual getMetadataKeys(obj, void), <[key0 key1 key2]>
  obj = {}
  assert.deepEqual getMetadataKeys({}, \name), []
  obj = {}
  defineMetadata \key \value obj, \name
  assert.deepEqual getMetadataKeys(obj, \name), <[key]>
  prototype = {}
  obj = create prototype
  defineMetadata \key \value prototype, \name
  assert.deepEqual getMetadataKeys(obj, \name), <[key]>
  obj = {}
  defineMetadata \key0 \value obj, \name
  defineMetadata \key1 \value obj, \name
  defineMetadata \key0 \value obj, \name
  assert.deepEqual getMetadataKeys(obj, \name), <[key0 key1]>
  prototype = {}
  defineMetadata \key2 \value prototype, \name
  obj = create prototype
  defineMetadata \key0 \value obj, \name
  defineMetadata \key1 \value obj, \name
  assert.deepEqual getMetadataKeys(obj, \name), <[key0 key1 key2]>