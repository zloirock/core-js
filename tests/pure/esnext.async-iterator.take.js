import AsyncIterator from 'core-js-pure/features/async-iterator';

import { createIterator } from '../helpers/helpers';

QUnit.test('AsyncIterator#take', assert => {
  assert.expect(8);
  const async = assert.async();
  const { take } = AsyncIterator.prototype;

  assert.isFunction(take);
  assert.arity(take, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'take');

  take.call(createIterator([1, 2, 3]), 2).toArray().then(it => {
    assert.arrayEqual(it, [1, 2], 'basic functionality');
    async();
  });

  assert.throws(() => take.call(undefined, 1), TypeError);
  assert.throws(() => take.call(null, 1), TypeError);
  assert.throws(() => take.call({}, 1), TypeError);
  assert.throws(() => take.call([], 1), TypeError);
});
