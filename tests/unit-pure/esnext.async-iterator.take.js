import { createIterator } from '../helpers/helpers.js';

import AsyncIterator from '@core-js/pure/full/async-iterator';

QUnit.test('AsyncIterator#take', assert => {
  const { take } = AsyncIterator.prototype;

  assert.isFunction(take);
  assert.arity(take, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'take');

  assert.throws(() => take.call(undefined, 1), TypeError);
  assert.throws(() => take.call(null, 1), TypeError);

  assert.throws(() => take.call(createIterator([1, 2, 3]), -1), RangeError, 'negative');
  assert.throws(() => take.call(createIterator([1, 2, 3]), NaN), RangeError, 'NaN');

  return take.call(createIterator([1, 2, 3]), 2).toArray().then(it => {
    assert.arrayEqual(it, [1, 2], 'basic functionality');
    return take.call(createIterator([1, 2, 3]), 1.5).toArray();
  }).then(it => {
    assert.arrayEqual(it, [1], 'float');
    return take.call(createIterator([1, 2, 3]), 4).toArray();
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3], 'big');
    return take.call(createIterator([1, 2, 3]), 0).toArray();
  }).then(it => {
    assert.arrayEqual(it, [], 'zero');
  });
});
