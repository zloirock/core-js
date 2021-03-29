import AsyncIterator from 'core-js-pure/full/async-iterator';

import { createIterator } from '../helpers/helpers';

QUnit.test('AsyncIterator#toArray', assert => {
  assert.expect(8);
  const async = assert.async();
  const { toArray } = AsyncIterator.prototype;

  assert.isFunction(toArray);
  assert.arity(toArray, 0);
  assert.nonEnumerable(AsyncIterator.prototype, 'toArray');

  toArray.call(createIterator([1, 2, 3])).then(it => {
    assert.arrayEqual(it, [1, 2, 3]);
    async();
  });

  assert.throws(() => toArray.call(undefined), TypeError);
  assert.throws(() => toArray.call(null), TypeError);
  assert.throws(() => toArray.call({}), TypeError);
  assert.throws(() => toArray.call([]), TypeError);
});
