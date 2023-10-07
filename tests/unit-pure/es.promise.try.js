import $try from 'core-js-pure/es/promise/try';
import Promise from 'core-js-pure/es/promise';

QUnit.test('Promise.try', assert => {
  assert.isFunction(Promise.try);
  assert.arity(Promise.try, 1);
  assert.true(Promise.try(() => 42) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise.try, resolved', assert => {
  return Promise.try(() => 42).then(it => {
    assert.same(it, 42, 'resolved with a correct value');
  });
});

QUnit.test('Promise.try, resolved, with args', assert => {
  return Promise.try((a, b) => Promise.resolve(a + b), 1, 2).then(it => {
    assert.same(it, 3, 'resolved with a correct value');
  });
});

QUnit.test('Promise.try, rejected', assert => {
  return Promise.try(() => {
    throw new Error();
  }).then(() => {
    assert.avoid();
  }, () => {
    assert.true(true, 'rejected as expected');
  });
});

QUnit.test('Promise.try, subclassing', assert => {
  const { try: promiseTry, resolve } = Promise;
  function SubPromise(executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  }
  SubPromise.resolve = resolve.bind(Promise);
  assert.true(promiseTry.call(SubPromise, () => 42) instanceof SubPromise, 'subclassing, `this` pattern');

  function FakePromise1() { /* empty */ }
  function FakePromise2(executor) {
    executor(null, () => { /* empty */ });
  }
  function FakePromise3(executor) {
    executor(() => { /* empty */ }, null);
  }
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = resolve.bind(Promise);
  assert.throws(() => {
    promiseTry.call(FakePromise1, () => 42);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    promiseTry.call(FakePromise2, () => 42);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    promiseTry.call(FakePromise3, () => 42);
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.try, without constructor context', assert => {
  const { try: promiseTry } = Promise;
  assert.throws(() => promiseTry(() => 42), TypeError, 'Throws if called without a constructor context');
  assert.throws(() => promiseTry.call(null, () => 42), TypeError, 'Throws if called with null as this');
});

QUnit.test('Promise.try, method from direct entry, without constructor context', assert => {
  return $try(() => 123).then(it => {
    assert.same(it, 123, 'resolved with a correct value');
  });
});

QUnit.test('Promise.try, method from direct entry, with null context', assert => {
  return $try.call(null, () => 'foo').then(it => {
    assert.same(it, 'foo', 'resolved with a correct value');
  });
});
