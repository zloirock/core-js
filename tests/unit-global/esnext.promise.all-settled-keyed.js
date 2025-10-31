QUnit.test('Promise.allSettledKeyed', assert => {
  assert.isFunction(Promise.allSettledKeyed);
  assert.arity(Promise.allSettledKeyed, 1);
  assert.looksNative(Promise.allSettledKeyed);
  assert.nonEnumerable(Promise, 'allSettledKeyed');
  assert.true(Promise.allSettledKeyed({}) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise.allSettledKeyed, resolved', assert => {
  return Promise.allSettledKeyed({
    a: Promise.resolve(1),
    b: Promise.resolve(2),
    c: Promise.resolve(3),
  }).then(it => {
    assert.deepEqual(it, {
      a: { value: 1, status: 'fulfilled' },
      b: { value: 2, status: 'fulfilled' },
      c: { value: 3, status: 'fulfilled' },
    }, 'resolved with a correct value');
  });
});

QUnit.test('Promise.allSettledKeyed, resolved with rejection', assert => {
  return Promise.allSettledKeyed({
    a: Promise.resolve(1),
    b: Promise.reject(2),
    c: Promise.resolve(3),
  }).then(it => {
    assert.deepEqual(it, {
      a: { value: 1, status: 'fulfilled' },
      b: { reason: 2, status: 'rejected' },
      c: { value: 3, status: 'fulfilled' },
    }, 'resolved with a correct value');
  });
});

QUnit.test('Promise.allSettledKeyed, rejected', assert => {
  return Promise.allSettledKeyed().then(() => {
    assert.avoid();
  }, () => {
    assert.required('rejected as expected');
  });
});

QUnit.test('Promise.allSettledKeyed, resolved with empty object', assert => {
  return Promise.allSettledKeyed({}).then(it => {
    assert.deepEqual(it, {}, 'resolved with a correct value');
  });
});

QUnit.test('Promise.allSettledKeyed, resolved with hidden attributes', assert => {
  const obj = Object.create({ proto: Promise.resolve('hidden') });
  obj.visible = Promise.resolve(42);
  Object.defineProperty(obj, 'invisible', { value: Promise.resolve(99), enumerable: false });
  return Promise.allSettledKeyed(obj).then(it => {
    assert.deepEqual(it, { visible: { status: 'fulfilled', value: 42 } }, 'ignores prototype/invisible');
  });
});

QUnit.test('Promise.allSettledKeyed, rejected on incorrect input', assert => {
  return Promise.allSettledKeyed('string').then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof TypeError, 'error is TypeError');
    assert.required('rejected as expected');
  });
});

QUnit.test('Promise.allSettledKeyed, resolved with timeouts', assert => {
  return Promise.allSettledKeyed({
    a: Promise.resolve(1),
    b: new Promise(resolve => setTimeout(() => resolve(2), 10)),
    c: Promise.resolve(3),
  }).then(it => {
    assert.deepEqual(it, {
      a: { value: 1, status: 'fulfilled' },
      b: { value: 2, status: 'fulfilled' },
      c: { value: 3, status: 'fulfilled' },
    }, 'keeps correct mapping, even with delays');
  });
});

QUnit.test('Promise.allSettledKeyed, subclassing', assert => {
  const { allSettledKeyed, resolve } = Promise;
  function SubPromise(executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  }
  SubPromise.resolve = resolve.bind(Promise);
  assert.true(allSettledKeyed.call(SubPromise, { a: 1, b: 2, c: 3 }) instanceof SubPromise, 'subclassing, `this` pattern');

  function FakePromise1() { /* empty */ }
  function FakePromise2(executor) {
    executor(null, () => { /* empty */ });
  }
  function FakePromise3(executor) {
    executor(() => { /* empty */ }, null);
  }
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = resolve.bind(Promise);
  assert.throws(() => {
    allSettledKeyed.call(FakePromise1, { a: 1, b: 2, c: 3 });
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    allSettledKeyed.call(FakePromise2, { a: 1, b: 2, c: 3 });
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    allSettledKeyed.call(FakePromise3, { a: 1, b: 2, c: 3 });
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.allSettledKeyed, without constructor context', assert => {
  const { allSettledKeyed } = Promise;
  assert.throws(() => allSettledKeyed({ a: Promise.resolve(1) }), TypeError, 'Throws if called without a constructor context');
  assert.throws(() => allSettledKeyed.call(null, { a: Promise.resolve(1) }), TypeError, 'Throws if called with null as this');
});

QUnit.test('Promise.allSettledKeyed, result object has null prototype', assert => {
  return Promise.allSettledKeyed({
    a: Promise.resolve(1),
    b: Promise.resolve(2),
  }).then(result => {
    assert.strictEqual(
      Object.getPrototypeOf(result),
      null,
      'Result object has null prototype',
    );
  });
});

QUnit.test('Promise.allSettledKeyed, symbol keys', assert => {
  const symA = Symbol('A');
  const symB = Symbol('B');
  return Promise.allSettledKeyed({
    a: Promise.resolve(1),
    [symA]: Promise.resolve(2),
    [symB]: Promise.resolve(3),
  }).then(it => {
    assert.deepEqual(it.a, { status: 'fulfilled', value: 1 }, 'string key');
    assert.deepEqual(it[symA], { status: 'fulfilled', value: 2 }, 'symbol key A');
    assert.deepEqual(it[symB], { status: 'fulfilled', value: 3 }, 'symbol key B');
  });
});

QUnit.test('Promise.allSettledKeyed, keys order', assert => {
  return Promise.allSettledKeyed({
    a: Promise.resolve(1),
    b: new Promise(resolve => setTimeout(() => resolve(2), 10)),
    c: Promise.resolve(3),
  }).then(it => {
    const actualKeys = Object.keys(it);
    assert.deepEqual(actualKeys, ['a', 'b', 'c'], 'correct order in the case when promises resolves in different order');
  });
});
