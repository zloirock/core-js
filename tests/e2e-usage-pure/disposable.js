// DisposableStack / AsyncDisposableStack / SuppressedError / Symbol.dispose

QUnit.test('DisposableStack: defer', assert => {
  const log = [];
  const stack = new DisposableStack();
  stack.defer(() => log.push('deferred'));
  stack.dispose();
  assert.deepEqual(log, ['deferred']);
});

QUnit.test('DisposableStack: use with Symbol.dispose', assert => {
  const log = [];
  const stack = new DisposableStack();
  const resource = { [Symbol.dispose]() { log.push('disposed'); } };
  stack.use(resource);
  stack.dispose();
  assert.deepEqual(log, ['disposed']);
});

QUnit.test('DisposableStack: multiple resources dispose in reverse order', assert => {
  const log = [];
  const stack = new DisposableStack();
  stack.defer(() => log.push('first'));
  stack.defer(() => log.push('second'));
  stack.dispose();
  assert.deepEqual(log, ['second', 'first']);
});

QUnit.test('DisposableStack: adopt', assert => {
  const log = [];
  const stack = new DisposableStack();
  stack.adopt(42, value => log.push(`adopted ${ value }`));
  stack.dispose();
  assert.deepEqual(log, ['adopted 42']);
});

QUnit.test('DisposableStack: move transfers ownership', assert => {
  const log = [];
  const stack1 = new DisposableStack();
  stack1.defer(() => log.push('moved'));
  const stack2 = stack1.move();
  assert.true(stack1.disposed);
  assert.false(stack2.disposed);
  stack2.dispose();
  assert.deepEqual(log, ['moved']);
});

QUnit.test('AsyncDisposableStack: constructor exists', assert => {
  assert.same(typeof AsyncDisposableStack, 'function');
});

QUnit.test('AsyncDisposableStack: disposeAsync', assert => {
  const async = assert.async();
  const log = [];
  const stack = new AsyncDisposableStack();
  stack.defer(() => log.push('async-deferred'));
  stack.disposeAsync().then(() => {
    assert.deepEqual(log, ['async-deferred']);
    async();
  });
});

QUnit.test('SuppressedError: properties', assert => {
  const suppressed = new Error('a');
  const error = new Error('b');
  const err = new SuppressedError(error, suppressed, 'msg');
  assert.true(err instanceof SuppressedError);
  assert.same(err.message, 'msg');
  assert.same(err.error, error);
  assert.same(err.suppressed, suppressed);
});

QUnit.test('Symbol.dispose exists', assert => {
  assert.notSame(Symbol.dispose, undefined);
});

QUnit.test('Symbol.asyncDispose exists', assert => {
  assert.notSame(Symbol.asyncDispose, undefined);
});

QUnit.test('using: Symbol.dispose class returning polyfill-built data', assert => {
  let disposed = 0;
  class Lock {
    [Symbol.dispose]() { disposed += 1; }
    names() { return Array.from(new Set(['a', 'b', 'a'])).toSorted(); }
  }
  {
    using lock = new Lock();
    assert.deepEqual(lock.names(), ['a', 'b']);
  }
  assert.same(disposed, 1);
});
