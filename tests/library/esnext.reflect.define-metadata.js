QUnit.test('Reflect.defineMetadata', assert => {
  const { defineMetadata } = core.Reflect;
  assert.isFunction(defineMetadata);
  assert.arity(defineMetadata, 4);
  assert.throws(() => defineMetadata('key', 'value', undefined, undefined), TypeError);
  assert.same(defineMetadata('key', 'value', {}, undefined), undefined);
  assert.same(defineMetadata('key', 'value', {}, 'name'), undefined);
});
