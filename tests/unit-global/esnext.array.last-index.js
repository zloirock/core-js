import { DESCRIPTORS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('Array#lastIndex', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'lastIndex');
  assert.isFunction(descriptor.get);
  assert.false(descriptor.enumerable);
  assert.true(descriptor.configurable);
  assert.same([1, 2, 3].lastIndex, 2);
  assert.same([].lastIndex, 0);
});
