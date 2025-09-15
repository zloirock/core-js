QUnit.test('Promise.allKeyed', assert => {
  assert.isFunction(Promise.allKeyed);
  assert.arity(Promise.allKeyed, 1);
  assert.looksNative(Promise.allKeyed);
  assert.nonEnumerable(Promise, 'allKeyed');
  assert.true(Promise.allKeyed({}) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise.allKeyed, rejected on incorrect input', assert => {
  return Promise.allKeyed('string').then(() => {
    assert.avoid();
  }, () => {
    assert.required('rejected as expected');
  });
});

QUnit.test('Promise.allKeyed, resolved', assert => {
  return Promise.allKeyed({
    a: Promise.resolve(1),
    b: Promise.resolve(2),
    c: Promise.resolve(3),
  }).then(it => {
    assert.deepEqual(it, {
      a: 1,
      b: 2,
      c: 3,
    }, 'resolved with a correct value');
  });
});

QUnit.test('Promise.allKeyed, resolved with rejection', assert => {
  return Promise.allKeyed({
    a: Promise.resolve(1),
    b: Promise.reject(2),
    c: Promise.resolve(3),
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 2, 'rejected with a correct value');
  });
});

QUnit.test('Promise.allKeyed, resolved with empty object', assert => {
  return Promise.allKeyed({}).then(it => {
    assert.deepEqual(it, {}, 'resolved with a correct value');
  });
});

QUnit.test('Promise.allKeyed, resolved with hidden attributes', assert => {
  const obj = Object.create({ proto: Promise.resolve('hidden') });
  obj.visible = Promise.resolve(42);
  Object.defineProperty(obj, 'invisible', { value: Promise.resolve(99), enumerable: false });
  return Promise.allKeyed(obj).then(it => {
    assert.deepEqual(it, { visible: 42 }, 'ignores prototype/invisible');
  });
});

QUnit.test('Promise.allKeyed, resolved with timeouts', assert => {
  return Promise.allKeyed({
    a: Promise.resolve(1),
    b: new Promise(resolve => setTimeout(() => resolve(2), 10)),
    c: Promise.resolve(3),
  }).then(it => {
    assert.deepEqual(it, {
      a: 1,
      b: 2,
      c: 3,
    }, 'keeps correct mapping, even with delays');
  });
});
