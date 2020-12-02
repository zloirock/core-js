import { STRICT } from '../helpers/constants';

QUnit.test('Array#flat', assert => {
  const { flat } = Array.prototype;
  const { defineProperty } = Object;
  assert.isFunction(flat);
  assert.name(flat, 'flat');
  assert.arity(flat, 0);
  assert.looksNative(flat);
  assert.nonEnumerable(Array.prototype, 'flat');
  assert.deepEqual([].flat(), []);
  const array = [1, [2, 3], [4, [5, 6]]];
  assert.deepEqual(array.flat(0), array);
  assert.deepEqual(array.flat(1), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(array.flat(), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(array.flat(2), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(array.flat(3), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(array.flat(-1), array);
  assert.deepEqual(array.flat(Infinity), [1, 2, 3, 4, 5, 6]);
  if (STRICT) {
    assert.throws(() => flat.call(null), TypeError);
    assert.throws(() => flat.call(undefined), TypeError);
  }
  assert.notThrows(() => flat.call(defineProperty({ length: -1 }, 0, {
    enumerable: true,
    get() {
      throw new Error();
    },
  })).length === 0, 'uses ToLength');
  assert.ok('flat' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
