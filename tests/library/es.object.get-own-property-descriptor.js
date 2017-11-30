QUnit.test('Object.getOwnPropertyDescriptor', assert => {
  const { getOwnPropertyDescriptor } = core.Object;
  assert.isFunction(getOwnPropertyDescriptor);
  assert.arity(getOwnPropertyDescriptor, 2);
  assert.deepEqual(getOwnPropertyDescriptor({ q: 42 }, 'q'), {
    writable: true,
    enumerable: true,
    configurable: true,
    value: 42,
  });
  assert.ok(getOwnPropertyDescriptor({}, 'toString') === undefined);
  const primitives = [42, 'foo', false];
  for (const value of primitives) {
    assert.ok((() => {
      try {
        getOwnPropertyDescriptor(value);
        return true;
      } catch (e) { /* empty */ }
    })(), `accept ${ typeof value }`);
  }
  assert.throws(() => {
    return getOwnPropertyDescriptor(null);
  }, TypeError, 'throws on null');
  assert.throws(() => {
    return getOwnPropertyDescriptor(undefined);
  }, TypeError, 'throws on undefined');
});
