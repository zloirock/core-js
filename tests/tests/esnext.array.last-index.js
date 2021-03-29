QUnit.test('Array#lastIndex', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'lastIndex');
  assert.isFunction(descriptor.get);
  assert.same(descriptor.enumerable, false);
  assert.same(descriptor.configurable, true);
  assert.same([1, 2, 3].lastIndex, 2);
  assert.same([].lastIndex, 0);
});
