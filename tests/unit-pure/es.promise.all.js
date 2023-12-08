import { createIterable } from '../helpers/helpers.js';

import getIteratorMethod from '@core-js/pure/es/get-iterator-method';
import Promise from '@core-js/pure/es/promise';
import Symbol from '@core-js/pure/es/symbol';

QUnit.test('Promise.all', assert => {
  const { all } = Promise;
  assert.isFunction(all);
  assert.arity(all, 1);
  assert.name(all, 'all');
  assert.true(Promise.all([]) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise.all, resolved', assert => {
  return Promise.all([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
  ]).then(it => {
    assert.deepEqual(it, [1, 2, 3], 'resolved with a correct value');
  });
});

QUnit.test('Promise.all, resolved with rejection', assert => {
  return Promise.all([
    Promise.resolve(1),
    Promise.reject(2),
    Promise.resolve(3),
  ]).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 2, 'rejected with a correct value');
  });
});

QUnit.test('Promise.all, resolved with empty array', assert => {
  return Promise.all([]).then(it => {
    assert.deepEqual(it, [], 'resolved with a correct value');
  });
});

QUnit.test('Promise.all, resolved with timeouts', assert => {
  return Promise.all([
    Promise.resolve(1),
    new Promise(resolve => setTimeout(() => resolve(2), 10)),
    Promise.resolve(3),
  ]).then(it => {
    assert.deepEqual(it, [1, 2, 3], 'keeps correct mapping, even with delays');
  });
});

QUnit.test('Promise.all, subclassing', assert => {
  const { all, resolve } = Promise;
  function SubPromise(executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  }
  SubPromise.resolve = resolve.bind(Promise);
  assert.true(all.call(SubPromise, [1, 2, 3]) instanceof SubPromise, 'subclassing, `this` pattern');

  function FakePromise1() { /* empty */ }
  function FakePromise2(executor) {
    executor(null, () => { /* empty */ });
  }
  function FakePromise3(executor) {
    executor(() => { /* empty */ }, null);
  }
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = resolve.bind(Promise);
  assert.throws(() => {
    all.call(FakePromise1, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    all.call(FakePromise2, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    all.call(FakePromise3, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.all, iterables', assert => {
  const iterable = createIterable([1, 2, 3]);
  Promise.all(iterable).catch(() => { /* empty */ });
  assert.true(iterable.received, 'works with iterables: iterator received');
  assert.true(iterable.called, 'works with iterables: next called');
});

QUnit.test('Promise.all, iterables 2', assert => {
  const array = [];
  let done = false;
  array[Symbol.iterator] = function () {
    done = true;
    return getIteratorMethod([]).call(this);
  };
  Promise.all(array);
  assert.true(done);
});

QUnit.test('Promise.all, iterator closing', assert => {
  const { resolve } = Promise;
  let done = false;
  try {
    Promise.resolve = function () {
      throw new Error();
    };
    Promise.all(createIterable([1, 2, 3], {
      return() {
        done = true;
      },
    })).catch(() => { /* empty */ });
  } catch { /* empty */ }
  Promise.resolve = resolve;
  assert.true(done, 'iteration closing');
});

QUnit.test('Promise.all, without constructor context', assert => {
  const { all } = Promise;
  assert.throws(() => all([]), TypeError, 'Throws if called without a constructor context');
  assert.throws(() => all.call(null, []), TypeError, 'Throws if called with null as this');
});
