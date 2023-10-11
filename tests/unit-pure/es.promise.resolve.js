import Promise from '@core-js/pure/es/promise';
import Symbol from '@core-js/pure/es/symbol';

QUnit.test('Promise.resolve', assert => {
  const { resolve } = Promise;
  assert.isFunction(resolve);
  assert.true(Promise.resolve(42) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise.resolve, resolves with value', assert => {
  return Promise.resolve(42).then(result => {
    assert.same(result, 42, 'resolved with a correct value');
  });
});

QUnit.test('Promise.resolve, resolves with thenable', assert => {
  const thenable = {
    // eslint-disable-next-line unicorn/no-thenable -- safe
    then(resolve) { resolve('foo'); },
  };
  return Promise.resolve(thenable).then(result => {
    assert.same(result, 'foo', 'resolved with a correct value');
  });
});

QUnit.test('Promise.resolve, returns input if input is already promise', assert => {
  const p = Promise.resolve('ok');
  assert.same(Promise.resolve(p), p, 'resolved with a correct value');
});

QUnit.test('Promise.resolve, resolves with undefined', assert => {
  return Promise.resolve().then(result => {
    assert.same(result, undefined, 'resolved with a correct value');
  });
});

QUnit.test('Promise.resolve, subclassing', assert => {
  const { resolve } = Promise;
  function SubPromise(executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  }
  SubPromise[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  assert.true(resolve.call(SubPromise, 42) instanceof SubPromise, 'subclassing, `this` pattern');

  function FakePromise1() { /* empty */ }
  function FakePromise2(executor) {
    executor(null, () => { /* empty */ });
  }
  function FakePromise3(executor) {
    executor(() => { /* empty */ }, null);
  }
  assert.throws(() => {
    resolve.call(FakePromise1, 42);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    resolve.call(FakePromise2, 42);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    resolve.call(FakePromise3, 42);
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.resolve, without constructor context', assert => {
  const { resolve } = Promise;
  assert.throws(() => resolve(''), TypeError, 'Throws if called without a constructor context');
  assert.throws(() => resolve.call(null, ''), TypeError, 'Throws if called with null as this');
});
