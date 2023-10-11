import { STRICT } from '../helpers/constants.js';
import { createIterator } from '../helpers/helpers.js';

import Iterator from '@core-js/pure/es/iterator';

QUnit.test('Iterator#take', assert => {
  const { take } = Iterator.prototype;

  assert.isFunction(take);
  assert.arity(take, 1);
  assert.nonEnumerable(Iterator.prototype, 'take');

  assert.arrayEqual(take.call(createIterator([1, 2, 3]), 2).toArray(), [1, 2], 'basic functionality');
  assert.arrayEqual(take.call(createIterator([1, 2, 3]), 1.5).toArray(), [1], 'float');
  assert.arrayEqual(take.call(createIterator([1, 2, 3]), 4).toArray(), [1, 2, 3], 'big');
  assert.arrayEqual(take.call(createIterator([1, 2, 3]), 0).toArray(), [], 'zero');

  if (STRICT) {
    assert.throws(() => take.call(undefined, 1), TypeError);
    assert.throws(() => take.call(null, 1), TypeError);
  }

  assert.throws(() => take.call({}, 1).next(), TypeError);
  assert.throws(() => take.call([], 1).next(), TypeError);
  assert.throws(() => take.call(createIterator([1, 2, 3]), -1), RangeError, 'negative');
  const it = createIterator([1], { return() { this.closed = true; } });
  assert.throws(() => take.call(it, NaN), RangeError, 'NaN');
  assert.true(it.closed, "take doesn't close iterator on validation error");
});
