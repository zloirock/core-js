QUnit.test('Iterator#toAsync', assert => {
  const { toAsync } = Iterator.prototype;

  assert.isFunction(toAsync);
  assert.arity(toAsync, 0);
  assert.name(toAsync, 'toAsync');
  assert.looksNative(toAsync);
  assert.nonEnumerable(Iterator.prototype, 'toAsync');

  assert.throws(() => toAsync.call(undefined), TypeError);
  assert.throws(() => toAsync.call(null), TypeError);

  const closableIterator = {
    closed: false,
    [Symbol.iterator]() { return this; },
    next() {
      return { value: Promise.reject(42), done: false };
    },
    return() {
      this.closed = true;
      return { value: undefined, done: true };
    },
  };

  return [1, 2, 3].values().toAsync().map(it => Promise.resolve(it)).toArray().then(it => {
    assert.arrayEqual(it, [1, 2, 3]);
    return new Set([1, 2, 3]).values().toAsync().map(el => Promise.resolve(el)).toArray();
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
