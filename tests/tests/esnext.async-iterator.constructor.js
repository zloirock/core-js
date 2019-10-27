QUnit.test('AsyncIterator', assert => {
  assert.isFunction(AsyncIterator);
  assert.arity(AsyncIterator, 0);
  assert.name(AsyncIterator, 'AsyncIterator');
  assert.looksNative(AsyncIterator);

  const asyncGenerator = (() => {
    try {
      return Function('return async function*(){}()')();
    } catch { /* empty */ }
  })();

  if (asyncGenerator) assert.ok(asyncGenerator instanceof AsyncIterator, 'AsyncGenerator');

  assert.ok(AsyncIterator.from([1, 2, 3]) instanceof AsyncIterator, 'Async From Proxy');
  assert.ok(AsyncIterator.from([1, 2, 3]).drop(1) instanceof AsyncIterator, 'Async Drop Proxy');

  assert.ok(new AsyncIterator() instanceof AsyncIterator, 'constructor');
  assert.throws(() => AsyncIterator(), 'throws w/o `new`');
});

QUnit.test('AsyncIterator#constructor', assert => {
  assert.strictEqual(AsyncIterator.prototype.constructor, AsyncIterator, 'AsyncIterator#constructor is AsyncIterator');
});

QUnit.test('AsyncIterator#@@toStringTag', assert => {
  assert.strictEqual(AsyncIterator.prototype[Symbol.toStringTag], 'AsyncIterator', 'AsyncIterator::@@toStringTag is `AsyncIterator`');
  assert.strictEqual(String(AsyncIterator.from([1, 2, 3])), '[object AsyncIterator]', 'correct stringification');
});
