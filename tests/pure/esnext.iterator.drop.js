import Iterator from 'core-js-pure/full/iterator';

import { createIterator } from '../helpers/helpers';

QUnit.test('Iterator#drop', assert => {
  const { drop } = Iterator.prototype;

  assert.isFunction(drop);
  assert.arity(drop, 1);
  assert.nonEnumerable(Iterator.prototype, 'drop');

  assert.arrayEqual(drop.call(createIterator([1, 2, 3]), 1).toArray(), [2, 3], 'basic functionality');
  assert.arrayEqual(drop.call(createIterator([1, 2, 3]), 1.5).toArray(), [2, 3], 'float');
  assert.arrayEqual(drop.call(createIterator([1, 2, 3]), 4).toArray(), [], 'big');
  assert.arrayEqual(drop.call(createIterator([1, 2, 3]), 0).toArray(), [1, 2, 3], 'zero');

  assert.throws(() => drop.call(undefined, 1), TypeError);
  assert.throws(() => drop.call(null, 1), TypeError);
  assert.throws(() => drop.call({}, 1), TypeError);
  assert.throws(() => drop.call([], 1), TypeError);
  assert.throws(() => drop.call(createIterator([1, 2, 3]), -1), RangeError, 'negative');
});
