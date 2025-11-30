import { createIterator } from '../helpers/helpers.js';

import AsyncIterator from '@core-js/pure/full/async-iterator';

QUnit.test('AsyncIterator#drop', assert => {
  const { drop } = AsyncIterator.prototype;

  assert.isFunction(drop);
  assert.arity(drop, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'drop');

  assert.throws(() => drop.call(undefined, 1), TypeError);
  assert.throws(() => drop.call(null, 1), TypeError);

  assert.throws(() => drop.call(createIterator([1, 2, 3]), -1), RangeError, 'negative');
  assert.throws(() => drop.call(createIterator([1, 2, 3]), NaN), RangeError, 'NaN');

  return drop.call(createIterator([1, 2, 3]), 1).toArray().then(it => {
    assert.arrayEqual(it, [2, 3], 'basic functionality');
    return drop.call(createIterator([1, 2, 3]), 1.5).toArray();
  }).then(it => {
    assert.arrayEqual(it, [2, 3], 'float');
    return drop.call(createIterator([1, 2, 3]), 4).toArray();
  }).then(it => {
    assert.arrayEqual(it, [], 'big');
    return drop.call(createIterator([1, 2, 3]), 0).toArray();
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3], 'zero');
  });
});
