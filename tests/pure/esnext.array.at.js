import { STRICT } from '../helpers/constants';

import at from 'core-js-pure/full/array/at';

QUnit.test('Array#at', assert => {
  assert.isFunction(at);
  assert.same(1, at([1, 2, 3], 0));
  assert.same(2, at([1, 2, 3], 1));
  assert.same(3, at([1, 2, 3], 2));
  assert.same(undefined, at([1, 2, 3], 3));
  assert.same(3, at([1, 2, 3], -1));
  assert.same(2, at([1, 2, 3], -2));
  assert.same(1, at([1, 2, 3], -3));
  assert.same(undefined, at([1, 2, 3], -4));
  assert.same(1, at([1, 2, 3], 0.4));
  assert.same(1, at([1, 2, 3], 0.5));
  assert.same(1, at([1, 2, 3], 0.6));
  assert.same(1, at([1], NaN));
  assert.same(1, at([1]));
  assert.same(1, at([1, 2, 3], -0));
  assert.same(undefined, at(Array(1), 0));
  assert.same(1, at({ 0: 1, length: 1 }, 0));
  if (STRICT) {
    assert.throws(() => at(null, 0), TypeError);
    assert.throws(() => at(undefined, 0), TypeError);
  }
});
