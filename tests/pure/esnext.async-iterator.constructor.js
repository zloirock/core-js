import AsyncIterator from 'core-js-pure/features/async-iterator';
import Symbol from 'core-js-pure/features/symbol';

QUnit.test('AsyncIterator', assert => {
  assert.isFunction(AsyncIterator);
  assert.arity(AsyncIterator, 0);

  assert.ok(AsyncIterator.from([1, 2, 3]) instanceof AsyncIterator, 'Async From Proxy');
  assert.ok(AsyncIterator.from([1, 2, 3]).drop(1) instanceof AsyncIterator, 'Async Drop Proxy');

  assert.ok(new AsyncIterator() instanceof AsyncIterator, 'constructor');
  assert.throws(() => AsyncIterator(), 'throws w/o `new`');
});

QUnit.test('AsyncIterator#@@toStringTag', assert => {
  assert.strictEqual(AsyncIterator.prototype[Symbol.toStringTag], 'AsyncIterator', 'AsyncIterator::@@toStringTag is `AsyncIterator`');
});
