import { STRICT } from '../helpers/constants';

import item from 'core-js-pure/features/array/item';

QUnit.test('Array#item', assert => {
  assert.isFunction(item);
  assert.same(1, item([1, 2, 3], 0));
  assert.same(2, item([1, 2, 3], 1));
  assert.same(3, item([1, 2, 3], 2));
  assert.same(undefined, item([1, 2, 3], 3));
  assert.same(3, item([1, 2, 3], -1));
  assert.same(2, item([1, 2, 3], -2));
  assert.same(1, item([1, 2, 3], -3));
  assert.same(undefined, item([1, 2, 3], -4));
  assert.same(1, item([1, 2, 3], 0.4));
  assert.same(1, item([1, 2, 3], 0.5));
  assert.same(1, item([1, 2, 3], 0.6));
  assert.same(1, item([1], NaN));
  assert.same(1, item([1]));
  assert.same(1, item([1, 2, 3], -0));
  assert.same(undefined, item(Array(1), 0));
  assert.same(1, item({ 0: 1, length: 1 }, 0));
  if (STRICT) {
    assert.throws(() => item(null, 0), TypeError);
    assert.throws(() => item(undefined, 0), TypeError);
  }
});
