const { getPrototypeOf } = Object;

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

  if (asyncGenerator && globalThis.USE_FUNCTION_CONSTRUCTOR) {
    const proto = getPrototypeOf(getPrototypeOf(getPrototypeOf(asyncGenerator)));
    if (proto !== Object.prototype && proto !== null) {
      assert.true(asyncGenerator instanceof AsyncIterator, 'AsyncGenerator');
    }
  }

  assert.true(AsyncIterator.from([1, 2, 3]) instanceof AsyncIterator, 'Async From Proxy');
  assert.true(AsyncIterator.from([1, 2, 3]).drop(1) instanceof AsyncIterator, 'Async Drop Proxy');

  assert.true(new AsyncIterator() instanceof AsyncIterator, 'constructor');
  assert.throws(() => AsyncIterator(), 'throws w/o `new`');
});

QUnit.test('AsyncIterator#constructor', assert => {
  assert.same(AsyncIterator.prototype.constructor, AsyncIterator, 'AsyncIterator#constructor is AsyncIterator');
});

QUnit.test('AsyncIterator#@@toStringTag', assert => {
  assert.same(AsyncIterator.prototype[Symbol.toStringTag], 'AsyncIterator', 'AsyncIterator::@@toStringTag is `AsyncIterator`');
  assert.same(String(AsyncIterator.from([1, 2, 3])), '[object AsyncIterator]', 'correct stringification');
});
