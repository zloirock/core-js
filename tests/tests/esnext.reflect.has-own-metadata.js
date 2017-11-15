QUnit.test('Reflect.hasOwnMetadata', assert => {
  const { defineMetadata, hasOwnMetadata } = Reflect;
  const { create } = Object;
  assert.isFunction(hasOwnMetadata);
  assert.arity(hasOwnMetadata, 2);
  assert.name(hasOwnMetadata, 'hasOwnMetadata');
  assert.looksNative(hasOwnMetadata);
  assert.nonEnumerable(Reflect, 'hasOwnMetadata');
  assert.throws(() => {
    return hasOwnMetadata('key', undefined, undefined);
  }, TypeError);
  assert.same(hasOwnMetadata('key', {}, undefined), false);
  let object = {};
  defineMetadata('key', 'value', object, undefined);
  assert.same(hasOwnMetadata('key', object, undefined), true);
  let prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, undefined);
  assert.same(hasOwnMetadata('key', object, undefined), false);
  assert.same(hasOwnMetadata('key', {}, 'name'), false);
  object = {};
  defineMetadata('key', 'value', object, 'name');
  assert.same(hasOwnMetadata('key', object, 'name'), true);
  prototype = {};
  object = create(prototype);
  defineMetadata('key', 'value', prototype, 'name');
  assert.same(hasOwnMetadata('key', object, 'name'), false);
});
