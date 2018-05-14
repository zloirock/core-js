import { DESCRIPTORS, STRICT } from '../helpers/constants';

import flatten from 'core-js-pure/features/array/flatten';
import defineProperty from 'core-js-pure/features/object/define-property';

QUnit.test('Array#flatten', assert => {
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
    assert.throws(() => flatten(null), TypeError);
    assert.throws(() => flatten(undefined), TypeError);
  }
  if (DESCRIPTORS) {
    assert.notThrows(() => flatten(defineProperty({ length: -1 }, 0, {
      get() {
        throw new Error();
      },
    })).length === 0, 'uses ToLength');
  }
});
