QUnit.test('Reflect.defineMetadata', assert => {
  const { defineMetadata } = Reflect;
  assert.isFunction(defineMetadata);
  assert.arity(defineMetadata, 4);
  assert.name(defineMetadata, 'defineMetadata');
  assert.looksNative(defineMetadata);
  assert.nonEnumerable(Reflect, 'defineMetadata');
  assert.throws(() => {
    return defineMetadata('key', 'value', undefined, undefined);
  }, TypeError);
  assert.same(defineMetadata('key', 'value', {}, undefined), undefined);
  assert.same(defineMetadata('key', 'value', {}, 'name'), undefined);
});
