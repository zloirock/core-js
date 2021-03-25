QUnit.test('Object.getOwnPropertyDescriptors', assert => {
  const { create, getOwnPropertyDescriptors } = Object;
  assert.isFunction(getOwnPropertyDescriptors);
  assert.arity(getOwnPropertyDescriptors, 1);
  assert.name(getOwnPropertyDescriptors, 'getOwnPropertyDescriptors');
  assert.looksNative(getOwnPropertyDescriptors);
  assert.nonEnumerable(Object, 'getOwnPropertyDescriptors');
  const object = create({ q: 1 }, { e: { value: 3 } });
  object.w = 2;
  const symbol = Symbol('4');
  object[symbol] = 4;
  const descriptors = getOwnPropertyDescriptors(object);
  assert.strictEqual(descriptors.q, undefined);
  assert.deepEqual(descriptors.w, {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 2,
  });
  assert.deepEqual(descriptors.e, {
    enumerable: false,
    configurable: false,
    writable: false,
    value: 3,
  });
  assert.strictEqual(descriptors[symbol].value, 4);
});
