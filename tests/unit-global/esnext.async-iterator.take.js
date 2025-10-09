import { createIterator } from '../helpers/helpers.js';

QUnit.test('AsyncIterator#take', assert => {
  const { take } = AsyncIterator.prototype;

  assert.isFunction(take);
  assert.arity(take, 1);
  assert.name(take, 'take');
  assert.looksNative(take);
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
