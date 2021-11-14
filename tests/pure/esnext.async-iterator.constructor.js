import Symbol from 'core-js-pure/es/symbol';

import AsyncIterator from 'core-js-pure/features/async-iterator';

QUnit.test('AsyncIterator', assert => {
  assert.isFunction(AsyncIterator);
  assert.arity(AsyncIterator, 0);

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
});
