QUnit.test('AsyncIterator.from', assert => {
  assert.expect(12);
  const async = assert.async();
  const { from } = AsyncIterator;

  assert.isFunction(from);
  assert.arity(from, 1);
  assert.name(from, 'from');
  assert.looksNative(from);
  assert.nonEnumerable(AsyncIterator, 'from');

  assert.ok(AsyncIterator.from([].values()) instanceof AsyncIterator, 'proxy, iterator');

  assert.ok(AsyncIterator.from([]) instanceof AsyncIterator, 'proxy, iterable');

  AsyncIterator.from([1, 2, 3]).toArray().then(result => {
    assert.arrayEqual(result, [1, 2, 3], 'just a proxy');
    async();
  });

  const asyncIterator = Object.assign(new AsyncIterator(), {
    next: () => { /* empty */ },
  });

  assert.same(AsyncIterator.from(asyncIterator), asyncIterator, 'does not wrap AsyncIterator instanses');

  assert.throws(() => from(undefined), TypeError);
  assert.throws(() => from(null), TypeError);
  assert.throws(() => from({}), TypeError);
});
