const { assign } = Object;

QUnit.test('AsyncIterator.from', assert => {
  const { from } = AsyncIterator;

  assert.isFunction(from);
  assert.arity(from, 1);
  assert.name(from, 'from');
  assert.looksNative(from);
  assert.nonEnumerable(AsyncIterator, 'from');

  assert.true(AsyncIterator.from([].values()) instanceof AsyncIterator, 'proxy, iterator');

  assert.true(AsyncIterator.from([]) instanceof AsyncIterator, 'proxy, iterable');

  const asyncIterator = assign(new AsyncIterator(), {
    next: () => { /* empty */ },
  });

  assert.same(AsyncIterator.from(asyncIterator), asyncIterator, 'does not wrap AsyncIterator instances');

  assert.throws(() => from(undefined), TypeError);
  assert.throws(() => from(null), TypeError);

  return AsyncIterator.from([1, Promise.resolve(2), 3]).toArray().then(result => {
    assert.arrayEqual(result, [1, 2, 3], 'unwrap promises');
  });
});
