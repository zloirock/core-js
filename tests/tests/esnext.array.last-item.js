QUnit.test('Array#lastItem', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'lastItem');
  assert.isFunction(descriptor.get);
  assert.isFunction(descriptor.set);
  assert.same(descriptor.enumerable, false);
  assert.same(descriptor.configurable, true);
  assert.same([1, 2, 3].lastItem, 3);
  assert.same([].lastItem, undefined);
  let array = [1, 2, 3];
  array.lastItem = 4;
  assert.deepEqual(array, [1, 2, 4]);
  array = [];
  array.lastItem = 5;
  assert.deepEqual(array, [5]);
});
