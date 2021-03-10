import { STRICT } from '../helpers/constants';

import flat from 'core-js-pure/full/array/flat';
import defineProperty from 'core-js-pure/full/object/define-property';

QUnit.test('Array#flat', assert => {
  assert.isFunction(flat);
  assert.deepEqual(flat([]), []);
  const array = [1, [2, 3], [4, [5, 6]]];
  assert.deepEqual(flat(array, 0), array);
  assert.deepEqual(flat(array, 1), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(flat(array), [1, 2, 3, 4, [5, 6]]);
  assert.deepEqual(flat(array, 2), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(flat(array, 3), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(flat(array, -1), array);
  assert.deepEqual(flat(array, Infinity), [1, 2, 3, 4, 5, 6]);
  if (STRICT) {
    assert.throws(() => flat(null), TypeError);
    assert.throws(() => flat(undefined), TypeError);
  }
  assert.notThrows(() => flat(defineProperty({ length: -1 }, 0, {
    get() {
      throw new Error();
    },
  })).length === 0, 'uses ToLength');
});
