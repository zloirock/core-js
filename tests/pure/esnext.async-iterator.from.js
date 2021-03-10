import AsyncIterator from 'core-js-pure/full/async-iterator';
import assign from 'core-js-pure/full/object/assign';
import values from 'core-js-pure/full/array/values';

QUnit.test('AsyncIterator.from', assert => {
  assert.expect(9);
  const async = assert.async();
  const { from } = AsyncIterator;

  assert.isFunction(from);
  assert.arity(from, 1);

  assert.ok(AsyncIterator.from(values([])) instanceof AsyncIterator, 'proxy, iterator');

  assert.ok(AsyncIterator.from([]) instanceof AsyncIterator, 'proxy, iterable');

  AsyncIterator.from([1, 2, 3]).toArray().then(result => {
    assert.arrayEqual(result, [1, 2, 3], 'just a proxy');
    async();
  });

  const asyncIterator = assign(new AsyncIterator(), {
    next: () => { /* empty */ },
  });

  assert.same(AsyncIterator.from(asyncIterator), asyncIterator, 'does not wrap AsyncIterator instanses');

  assert.throws(() => from(undefined), TypeError);
  assert.throws(() => from(null), TypeError);
  assert.throws(() => from({}), TypeError);
});
