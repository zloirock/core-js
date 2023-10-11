import Promise from '@core-js/pure/es/promise';
import assign from '@core-js/pure/es/object/assign';
import create from '@core-js/pure/es/object/create';
import values from '@core-js/pure/es/array/values';
import AsyncIterator from '@core-js/pure/actual/async-iterator';

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

  return AsyncIterator.from([1, Promise.resolve(2), 3]).toArray().then(result => {
    assert.arrayEqual(result, [1, 2, 3], 'unwrap promises');
  });
});
