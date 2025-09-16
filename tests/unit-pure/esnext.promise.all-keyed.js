import Promise from '@core-js/pure/full/promise';
import Symbol from '@core-js/pure/full/symbol';
import Object from '@core-js/pure/full/object';

QUnit.test('Promise.allKeyed', assert => {
  assert.isFunction(Promise.allKeyed);
  assert.arity(Promise.allKeyed, 1);
  assert.true(Promise.allKeyed({}) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise.allKeyed, rejected on incorrect input', assert => {
  return Promise.allKeyed('string').then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof TypeError, 'error is TypeError');
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

QUnit.test('Promise.allKeyed, symbol keys', assert => {
  const symA = Symbol('A');
  const symB = Symbol('B');
  return Promise.allKeyed({
    a: Promise.resolve(1),
    [symA]: Promise.resolve(2),
    [symB]: Promise.resolve(3),
  }).then(it => {
    assert.same(it.a, 1, 'string key');
    assert.same(it[symA], 2, 'symbol key A');
    assert.same(it[symB], 3, 'symbol key B');
  });
});

QUnit.test('Promise.allKeyed, keys order', assert => {
  return Promise.allKeyed({
    a: Promise.resolve(1),
    b: new Promise(resolve => setTimeout(() => resolve(2), 10)),
    c: Promise.resolve(3),
  }).then(it => {
    const actualKeys = Object.keys(it);
    assert.deepEqual(actualKeys, ['a', 'b', 'c'], 'correct order in the case when promises resolves in different order');
  });
});

QUnit.test('Promise.allKeyed, fake promises', assert => {
  const { allKeyed } = Promise;
  const FakePromise1 = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  const FakePromise2 = FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  FakePromise1.resolve = FakePromise2.resolve = Promise.resolve.bind(Promise);
  assert.true(allKeyed.call(FakePromise1, { a: Promise.resolve(1) }) instanceof FakePromise1, 'subclassing, `this` pattern');
});

QUnit.test('Promise.allKeyed, result object has null prototype', assert => {
  return Promise.allKeyed({
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
