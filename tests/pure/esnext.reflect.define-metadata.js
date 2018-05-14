import defineMetadata from 'core-js-pure/features/reflect/define-metadata';

QUnit.test('Reflect.defineMetadata', assert => {
  assert.isFunction(defineMetadata);
  assert.arity(defineMetadata, 4);
  assert.throws(() => defineMetadata('key', 'value', undefined, undefined), TypeError);
  assert.same(defineMetadata('key', 'value', {}, undefined), undefined);
  assert.same(defineMetadata('key', 'value', {}, 'name'), undefined);
});
