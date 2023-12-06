import Promise from '@core-js/pure/es/promise';
import Set from '@core-js/pure/es/set';
import ITERATOR from '@core-js/pure/es/symbol/iterator';
import Iterator from '@core-js/pure/full/iterator';

import '@core-js/pure/full/async-iterator';

QUnit.test('Iterator#toAsync', assert => {
  const { toAsync } = Iterator.prototype;

  assert.isFunction(toAsync);
  assert.arity(toAsync, 0);

  assert.throws(() => toAsync.call(undefined), TypeError);
  assert.throws(() => toAsync.call(null), TypeError);

  const closableIterator = {
    closed: false,
    [ITERATOR]() { return this; },
    next() {
      return { value: Promise.reject(42), done: false };
    },
    return() {
      this.closed = true;
      return { value: undefined, done: true };
    },
  };

  return Iterator.from([1, 2, 3]).toAsync().map(it => Promise.resolve(it)).toArray().then(it => {
    assert.arrayEqual(it, [1, 2, 3]);
    return Iterator.from(new Set([1, 2, 3])).toAsync().map(el => Promise.resolve(el)).toArray();
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3]);
  }).then(() => {
    return Iterator.from(closableIterator).toAsync().toArray();
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a `.next()` promise rejection');
    assert.true(closableIterator.closed, 'closes sync iterator on promise rejection');
  });
});
