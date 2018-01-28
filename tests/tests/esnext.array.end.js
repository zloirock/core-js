import { DESCRIPTORS } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('Array#end', assert => {
  const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'end');
  assert.isFunction(descriptor.get);
  assert.isFunction(descriptor.set);
  assert.same(descriptor.enumerable, false);
  assert.same(descriptor.configurable, true);
  assert.same([1, 2, 3].end, 3);
  assert.same([].end, undefined);
  let array = [1, 2, 3];
  array.end = 4;
  assert.deepEqual(array, [1, 2, 4]);
  array = [];
  array.end = 5;
  assert.deepEqual(array, [5]);
});
