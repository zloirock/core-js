import getOwnPropertyDescriptor from '../../packages/core-js-pure/fn/reflect/get-own-property-descriptor';

QUnit.test('Reflect.getOwnPropertyDescriptor', assert => {
  assert.isFunction(getOwnPropertyDescriptor);
  assert.arity(getOwnPropertyDescriptor, 2);
  if ('name' in getOwnPropertyDescriptor) {
    assert.name(getOwnPropertyDescriptor, 'getOwnPropertyDescriptor');
  }
  const object = { baz: 789 };
  const descriptor = getOwnPropertyDescriptor(object, 'baz');
  assert.strictEqual(descriptor.value, 789);
  assert.throws(() => getOwnPropertyDescriptor(42, 'constructor'), TypeError, 'throws on primitive');
});
