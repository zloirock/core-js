QUnit.test('Reflect.getMetadataKeys', assert => {
  const { defineMetadata, getMetadataKeys } = Reflect;
  const { create } = Object;
  assert.isFunction(getMetadataKeys);
  assert.arity(getMetadataKeys, 1);
  assert.name(getMetadataKeys, 'getMetadataKeys');
  assert.looksNative(getMetadataKeys);
  assert.nonEnumerable(Reflect, 'getMetadataKeys');
  assert.throws(() => getMetadataKeys(undefined, undefined), TypeError);
  assert.deepEqual(getMetadataKeys({}, undefined), []);
  let object = {};
  defineMetadata('key', 'value', object, undefined);
  assert.deepEqual(getMetadataKeys(object, undefined), ['key']);
  let prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, undefined);
  assert.deepEqual(getMetadataKeys(object, undefined), ['key']);
  object = {};
  defineMetadata('key0', 'value', object, undefined);
  defineMetadata('key1', 'value', object, undefined);
  assert.deepEqual(getMetadataKeys(object, undefined), ['key0', 'key1']);
  object = {};
  defineMetadata('key0', 'value', object, undefined);
  defineMetadata('key1', 'value', object, undefined);
  defineMetadata('key0', 'value', object, undefined);
  assert.deepEqual(getMetadataKeys(object, undefined), ['key0', 'key1']);
  prototype = {};
  defineMetadata('key2', 'value', prototype, undefined);
  object = create(prototype);
  defineMetadata('key0', 'value', object, undefined);
  defineMetadata('key1', 'value', object, undefined);
  assert.deepEqual(getMetadataKeys(object, undefined), ['key0', 'key1', 'key2']);
  object = {};
  assert.deepEqual(getMetadataKeys({}, 'name'), []);
  object = {};
  defineMetadata('key', 'value', object, 'name');
  assert.deepEqual(getMetadataKeys(object, 'name'), ['key']);
  prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, 'name');
  assert.deepEqual(getMetadataKeys(object, 'name'), ['key']);
  object = {};
  defineMetadata('key0', 'value', object, 'name');
  defineMetadata('key1', 'value', object, 'name');
  defineMetadata('key0', 'value', object, 'name');
  assert.deepEqual(getMetadataKeys(object, 'name'), ['key0', 'key1']);
  prototype = {};
  defineMetadata('key2', 'value', prototype, 'name');
  object = create(prototype);
  defineMetadata('key0', 'value', object, 'name');
  defineMetadata('key1', 'value', object, 'name');
  assert.deepEqual(getMetadataKeys(object, 'name'), ['key0', 'key1', 'key2']);
});
