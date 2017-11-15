QUnit.test('Reflect.getOwnPropertyDescriptor', assert => {
  const { getOwnPropertyDescriptor } = core.Reflect;
  assert.isFunction(getOwnPropertyDescriptor);
  assert.arity(getOwnPropertyDescriptor, 2);
  if ('name' in getOwnPropertyDescriptor) {
    assert.name(getOwnPropertyDescriptor, 'getOwnPropertyDescriptor');
  }
  const object = { baz: 789 };
  const descriptor = getOwnPropertyDescriptor(object, 'baz');
  assert.strictEqual(descriptor.value, 789);
  assert.throws(() => {
    return getOwnPropertyDescriptor(42, 'constructor');
  }, TypeError, 'throws on primitive');
});
