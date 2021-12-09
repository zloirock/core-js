QUnit.test('Iterator#toAsync', assert => {
  assert.expect(9);
  const async = assert.async();

  const { toAsync } = Iterator.prototype;

  assert.isFunction(toAsync);
  assert.arity(toAsync, 0);
  assert.name(toAsync, 'toAsync');
  assert.looksNative(toAsync);
  assert.nonEnumerable(Iterator.prototype, 'toAsync');

  assert.throws(() => toAsync.call(undefined), TypeError);
  assert.throws(() => toAsync.call(null), TypeError);

  [1, 2, 3].values().toAsync().map(it => Promise.resolve(it)).toArray().then(it => {
    assert.arrayEqual(it, [1, 2, 3]);
  }).then(() => {
    return new Set([1, 2, 3]).values().toAsync().map(it => Promise.resolve(it)).toArray();
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3]);
    async();
  });
});
