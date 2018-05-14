import { DESCRIPTORS, STRICT } from '../helpers/constants';

QUnit.test('Array#flatten', assert => {
  const { flatten } = Array.prototype;
  const { defineProperty } = Object;
  assert.isFunction(flatten);
  assert.name(flatten, 'flatten');
  assert.arity(flatten, 0);
  assert.looksNative(flatten);
  assert.nonEnumerable(Array.prototype, 'flatten');
  assert.deepEqual([].flatten(), []);
  const array = [1, [2, 3], [4, [5, 6]]];
  assert.deepEqual(array.flatten(0), array);
  assert.deepEqual(array.flatten(1), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(array.flatten(), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(array.flatten(2), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(array.flatten(3), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(array.flatten(-1), array);
  assert.deepEqual(array.flatten(Infinity), [1, 2, 3, 4, 5, 6]);
  if (STRICT) {
    assert.throws(() => flatten.call(null), TypeError);
    assert.throws(() => flatten.call(undefined), TypeError);
  }
  if (DESCRIPTORS) {
    assert.notThrows(() => flatten.call(defineProperty({ length: -1 }, 0, {
      get() {
        throw new Error();
      },
    })).length === 0, 'uses ToLength');
  }
  assert.ok('flatten' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
