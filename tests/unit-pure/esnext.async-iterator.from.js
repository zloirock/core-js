import Promise from '@core-js/pure/es/promise';
import assign from '@core-js/pure/es/object/assign';
import values from '@core-js/pure/es/array/values';
import ITERATOR from '@core-js/pure/es/symbol/iterator';
import AsyncIterator from '@core-js/pure/full/async-iterator';
import Iterator from '@core-js/pure/full/iterator';

const { create } = Object;

QUnit.test('AsyncIterator.from', assert => {
  const { from } = AsyncIterator;

  assert.isFunction(from);
  assert.arity(from, 1);

  assert.true(AsyncIterator.from(values([])) instanceof AsyncIterator, 'proxy, iterator');

  assert.true(AsyncIterator.from([]) instanceof AsyncIterator, 'proxy, iterable');

  const asyncIterator = assign(create(AsyncIterator.prototype), {
    next: () => { /* empty */ },
  });

  assert.same(AsyncIterator.from(asyncIterator), asyncIterator, 'does not wrap AsyncIterator instances');

  assert.throws(() => from(undefined), TypeError);
  assert.throws(() => from(null), TypeError);

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

  return AsyncIterator.from([1, Promise.resolve(2), 3]).toArray().then(result => {
    assert.arrayEqual(result, [1, 2, 3], 'unwrap promises');
  }).then(() => {
    return from(Iterator.from(closableIterator)).toArray();
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
    assert.true(closableIterator.closed, 'doesn\'t close sync iterator on promise rejection');
  });
});
