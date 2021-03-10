import Iterator from 'core-js-pure/full/iterator';

import { createIterator } from '../helpers/helpers';

QUnit.test('Iterator#take', assert => {
  const { take } = Iterator.prototype;

  assert.isFunction(take);
  assert.arity(take, 1);
  assert.nonEnumerable(Iterator.prototype, 'take');

  assert.arrayEqual(take.call(createIterator([1, 2, 3]), 2).toArray(), [1, 2], 'basic functionality');
  assert.arrayEqual(take.call(createIterator([1, 2, 3]), 1.5).toArray(), [1], 'float');
  assert.arrayEqual(take.call(createIterator([1, 2, 3]), 4).toArray(), [1, 2, 3], 'big');
  assert.arrayEqual(take.call(createIterator([1, 2, 3]), 0).toArray(), [], 'zero');

  assert.throws(() => take.call(undefined, 1), TypeError);
  assert.throws(() => take.call(null, 1), TypeError);
  assert.throws(() => take.call({}, 1), TypeError);
  assert.throws(() => take.call([], 1), TypeError);
  assert.throws(() => take.call(createIterator([1, 2, 3]), -1), RangeError, 'negative');
});
