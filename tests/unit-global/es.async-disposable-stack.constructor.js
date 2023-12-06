QUnit.test('AsyncDisposableStack constructor', assert => {
  assert.isFunction(AsyncDisposableStack);
  assert.arity(AsyncDisposableStack, 0);
  assert.name(AsyncDisposableStack, 'AsyncDisposableStack');
  assert.looksNative(AsyncDisposableStack);

  assert.throws(() => AsyncDisposableStack(), 'throws w/o `new`');
  assert.true(new AsyncDisposableStack() instanceof AsyncDisposableStack);

  assert.same(AsyncDisposableStack.prototype.constructor, AsyncDisposableStack);
});

QUnit.test('AsyncDisposableStack#disposeAsync', assert => {
  assert.isFunction(AsyncDisposableStack.prototype.disposeAsync);
  assert.arity(AsyncDisposableStack.prototype.disposeAsync, 0);
  assert.name(AsyncDisposableStack.prototype.disposeAsync, 'disposeAsync');
  assert.looksNative(AsyncDisposableStack.prototype.disposeAsync);
  assert.nonEnumerable(AsyncDisposableStack.prototype, 'disposeAsync');
});

QUnit.test('AsyncDisposableStack#use', assert => {
  assert.isFunction(AsyncDisposableStack.prototype.use);
  assert.arity(AsyncDisposableStack.prototype.use, 1);
  assert.name(AsyncDisposableStack.prototype.use, 'use');
  assert.looksNative(AsyncDisposableStack.prototype.use);
  assert.nonEnumerable(AsyncDisposableStack.prototype, 'use');

  let result = '';
  const stack = new AsyncDisposableStack();
  const resource = {
    [Symbol.asyncDispose]() {
      result += '1';
      assert.same(this, resource);
      assert.same(arguments.length, 0);
    },
  };

  assert.same(stack.use(resource), resource);

  return stack.disposeAsync().then(it => {
    assert.same(it, undefined);
    assert.same(result, '1');
  });
});

QUnit.test('AsyncDisposableStack#adopt', assert => {
  assert.isFunction(AsyncDisposableStack.prototype.adopt);
  assert.arity(AsyncDisposableStack.prototype.adopt, 2);
  assert.name(AsyncDisposableStack.prototype.adopt, 'adopt');
  assert.looksNative(AsyncDisposableStack.prototype.adopt);
  assert.nonEnumerable(AsyncDisposableStack.prototype, 'adopt');

  let result = '';
  const stack = new AsyncDisposableStack();
  const resource = {};

  assert.same(stack.adopt(resource, function (arg) {
    result += '1';
    assert.same(this, undefined);
    assert.same(arguments.length, 1);
    assert.same(arg, resource);
  }), resource);

  return stack.disposeAsync().then(it => {
    assert.same(it, undefined);
    assert.same(result, '1');
  });
});

QUnit.test('AsyncDisposableStack#defer', assert => {
  assert.isFunction(AsyncDisposableStack.prototype.defer);
  assert.arity(AsyncDisposableStack.prototype.defer, 1);
  assert.name(AsyncDisposableStack.prototype.defer, 'defer');
  assert.looksNative(AsyncDisposableStack.prototype.defer);
  assert.nonEnumerable(AsyncDisposableStack.prototype, 'defer');

  let result = '';
  const stack = new AsyncDisposableStack();

  assert.same(stack.defer(function () {
    result += '1';
    assert.same(this, undefined);
    assert.same(arguments.length, 0);
  }), undefined);

  return stack.disposeAsync().then(it => {
    assert.same(it, undefined);
    assert.same(result, '1');
  });
});

QUnit.test('AsyncDisposableStack#move', assert => {
  assert.isFunction(AsyncDisposableStack.prototype.move);
  assert.arity(AsyncDisposableStack.prototype.move, 0);
  assert.name(AsyncDisposableStack.prototype.move, 'move');
  assert.looksNative(AsyncDisposableStack.prototype.move);
  assert.nonEnumerable(AsyncDisposableStack.prototype, 'move');

  let result = '';
  const stack1 = new AsyncDisposableStack();

  stack1.defer(() => result += '2');
  stack1.defer(() => result += '1');

  const stack2 = stack1.move();

  assert.true(stack1.disposed);

  return stack2.disposeAsync().then(() => {
    assert.same(result, '12');
  });
});

QUnit.test('AsyncDisposableStack#@@asyncDispose', assert => {
  assert.same(AsyncDisposableStack.prototype[Symbol.asyncDispose], AsyncDisposableStack.prototype.disposeAsync);
});

QUnit.test('AsyncDisposableStack#@@toStringTag', assert => {
  assert.same(AsyncDisposableStack.prototype[Symbol.toStringTag], 'AsyncDisposableStack', '@@toStringTag');
});

QUnit.test('AsyncDisposableStack#1', assert => {
  let result = '';
  const stack = new AsyncDisposableStack();

  stack.use({ [Symbol.asyncDispose]: () => result += '6' });
  stack.adopt({}, () => result += '5');
  stack.defer(() => result += '4');
  stack.use({ [Symbol.asyncDispose]: () => Promise.resolve(result += '3') });
  stack.adopt({}, () => Promise.resolve(result += '2'));
  stack.defer(() => Promise.resolve(result += '1'));

  assert.false(stack.disposed);

  return stack.disposeAsync().then(it => {
    assert.same(it, undefined);
    assert.same(result, '123456');
    assert.true(stack.disposed);
    return stack.disposeAsync();
  }).then(it => {
    assert.same(it, undefined);
  });
});

QUnit.test('AsyncDisposableStack#2', assert => {
  let result = '';
  const stack = new AsyncDisposableStack();

  stack.use({ [Symbol.asyncDispose]: () => result += '6' });
  stack.adopt({}, () => { throw new Error(5); });
  stack.defer(() => result += '4');
  stack.use({ [Symbol.asyncDispose]: () => Promise.resolve(result += '3') });
  stack.adopt({}, () => Promise.resolve(result += '2'));
  stack.defer(() => Promise.resolve(result += '1'));

  return stack.disposeAsync().then(() => {
    assert.avoid();
  }, error => {
    assert.same(result, '12346');
    assert.true(error instanceof Error);
    assert.same(error.message, '5');
  });
});

QUnit.test('AsyncDisposableStack#3', assert => {
  let result = '';
  const stack = new AsyncDisposableStack();

  stack.use({ [Symbol.asyncDispose]: () => result += '6' });
  stack.adopt({}, () => { throw new Error(5); });
  stack.defer(() => result += '4');
  stack.use({ [Symbol.asyncDispose]: () => Promise.reject(new Error(3)) });
  stack.adopt({}, () => Promise.resolve(result += '2'));
  stack.defer(() => Promise.resolve(result += '1'));

  return stack.disposeAsync().then(() => {
    assert.avoid();
  }, error => {
    assert.same(result, '1246');
    assert.true(error instanceof SuppressedError);
    assert.same(error.error.message, '5');
    assert.same(error.suppressed.message, '3');
  });
});

// https://github.com/tc39/proposal-explicit-resource-management/issues/256
QUnit.test('AsyncDisposableStack#256', assert => {
  const resume = assert.async();
  assert.expect(1);
  let called = false;
  const stack = new AsyncDisposableStack();
  const neverResolves = new Promise(() => { /* empty */ });
  stack.use({ [Symbol.dispose]() { return neverResolves; } });
  stack.disposeAsync().then(() => {
    called = true;
    assert.required('It should be called');
    resume();
  });
  setTimeout(() => called || resume(), 3e3);
});
