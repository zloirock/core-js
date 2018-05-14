import { STRICT } from '../helpers/constants';

import copyWithin from 'core-js-pure/features/array/copy-within';

QUnit.test('Array#copyWithin', assert => {
  assert.isFunction(copyWithin);
  const array = [1];
  assert.strictEqual(copyWithin(array, 0), array);
  assert.deepEqual(copyWithin([1, 2, 3, 4, 5], 0, 3), [4, 5, 3, 4, 5]);
  assert.deepEqual(copyWithin([1, 2, 3, 4, 5], 1, 3), [1, 4, 5, 4, 5]);
  assert.deepEqual(copyWithin([1, 2, 3, 4, 5], 1, 2), [1, 3, 4, 5, 5]);
  assert.deepEqual(copyWithin([1, 2, 3, 4, 5], 2, 2), [1, 2, 3, 4, 5]);
  assert.deepEqual(copyWithin([1, 2, 3, 4, 5], 0, 3, 4), [4, 2, 3, 4, 5]);
  assert.deepEqual(copyWithin([1, 2, 3, 4, 5], 1, 3, 4), [1, 4, 3, 4, 5]);
  assert.deepEqual(copyWithin([1, 2, 3, 4, 5], 1, 2, 4), [1, 3, 4, 4, 5]);
  assert.deepEqual(copyWithin([1, 2, 3, 4, 5], 0, -2), [4, 5, 3, 4, 5]);
  assert.deepEqual(copyWithin([1, 2, 3, 4, 5], 0, -2, -1), [4, 2, 3, 4, 5]);
  assert.deepEqual(copyWithin([1, 2, 3, 4, 5], -4, -3, -2), [1, 3, 3, 4, 5]);
  assert.deepEqual(copyWithin([1, 2, 3, 4, 5], -4, -3, -1), [1, 3, 4, 4, 5]);
  assert.deepEqual(copyWithin([1, 2, 3, 4, 5], -4, -3), [1, 3, 4, 5, 5]);
  if (STRICT) {
    assert.throws(() => copyWithin(null, 0), TypeError);
    assert.throws(() => copyWithin(undefined, 0), TypeError);
  }
});
