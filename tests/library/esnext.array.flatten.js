import { DESCRIPTORS, STRICT } from '../helpers/constants';

QUnit.test('Array#flatten', assert => {
  const { flatten } = core.Array;
  const { defineProperty } = core.Object;
  assert.isFunction(flatten);
  assert.deepEqual(flatten([]), []);
  const array = [1, [2, 3], [4, [5, 6]]];
  assert.deepEqual(flatten(array, 0), array);
  assert.deepEqual(flatten(array, 1), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(flatten(array), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(flatten(array, 2), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(flatten(array, 3), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(flatten(array, -1), array);
  assert.deepEqual(flatten(array, Infinity), [1, 2, 3, 4, 5, 6]);
  if (STRICT) {
    assert.throws(() => {
      return flatten(null);
    }, TypeError);
    assert.throws(() => {
      return flatten(undefined);
    }, TypeError);
  }
  if (DESCRIPTORS) {
    assert.ok((() => {
      try {
        return flatten(defineProperty({ length: -1 }, 0, {
          get() {
            throw new Error();
          },
        })).length === 0;
      } catch (e) { /* empty */ }
    })(), 'uses ToLength');
  }
});
