import $allKeyed from '@core-js/pure/full/promise/all-keyed';
import Promise from '@core-js/pure/full/promise';
import Symbol from '@core-js/pure/es/symbol';

QUnit.test('Promise.allKeyed', assert => {
  assert.isFunction(Promise.allKeyed);
  assert.arity(Promise.allKeyed, 1);
  assert.true(Promise.allKeyed({}) instanceof Promise, 'returns a promise');
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

QUnit.test('Promise.allKeyed, rejected on incorrect input', assert => {
  return Promise.allKeyed('string').then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof TypeError, 'error is TypeError');
    assert.required('rejected as expected');
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

QUnit.test('Promise.allKeyed, subclassing', assert => {
  const { allKeyed, resolve } = Promise;
  function SubPromise(executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  }
  SubPromise.resolve = resolve.bind(Promise);
  assert.true(allKeyed.call(SubPromise, { a: Promise.resolve(1) }) instanceof SubPromise, 'subclassing, `this` pattern');

  function FakePromise1() { /* empty */ }
  function FakePromise2(executor) {
    executor(null, () => { /* empty */ });
  }
  function FakePromise3(executor) {
    executor(() => { /* empty */ }, null);
  }
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = resolve.bind(Promise);
  assert.throws(() => {
    allKeyed.call(FakePromise1, { a: Promise.resolve(1) });
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    allKeyed.call(FakePromise2, { a: Promise.resolve(1) });
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    allKeyed.call(FakePromise3, { a: Promise.resolve(1) });
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.allKeyed, without constructor context', assert => {
  const { allKeyed } = Promise;
  assert.throws(() => allKeyed({ a: Promise.resolve(1) }), TypeError, 'Throws if called without a constructor context');
  assert.throws(() => allKeyed.call(null, { a: Promise.resolve(1) }), TypeError, 'Throws if called with null as this');
});

QUnit.test('Promise.allKeyed, method from direct entry, without constructor context', assert => {
  return $allKeyed({ a: Promise.resolve(1) }).then(it => {
    assert.deepEqual(it, { a: 1 }, 'resolved with a correct value');
  });
});

QUnit.test('Promise.allKeyed, method from direct entry, with null context', assert => {
  return $allKeyed.call(null, { a: Promise.resolve(1) }).then(it => {
    assert.deepEqual(it, { a: 1 }, 'resolved with a correct value');
  });
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
