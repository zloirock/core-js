import { createIterable } from '../helpers/helpers.js';

QUnit.test('Promise.allSettled', assert => {
  assert.isFunction(Promise.allSettled);
  assert.arity(Promise.allSettled, 1);
  assert.looksNative(Promise.allSettled);
  assert.nonEnumerable(Promise, 'allSettled');
  assert.true(Promise.allSettled([1, 2, 3]) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise.allSettled, resolved', assert => {
  return Promise.allSettled([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
  ]).then(it => {
    assert.deepEqual(it, [
      { value: 1, status: 'fulfilled' },
      { value: 2, status: 'fulfilled' },
      { value: 3, status: 'fulfilled' },
    ], 'resolved with a correct value');
  });
});

QUnit.test('Promise.allSettled, resolved with rejection', assert => {
  return Promise.allSettled([
    Promise.resolve(1),
    Promise.reject(2),
    Promise.resolve(3),
  ]).then(it => {
    assert.deepEqual(it, [
      { value: 1, status: 'fulfilled' },
      { reason: 2, status: 'rejected' },
      { value: 3, status: 'fulfilled' },
    ], 'resolved with a correct value');
  });
});

QUnit.test('Promise.allSettled, rejected', assert => {
  // eslint-disable-next-line promise/valid-params -- required for testing
  return Promise.allSettled().then(() => {
    assert.avoid();
  }, () => {
    assert.required('rejected as expected');
  });
});

QUnit.test('Promise.allSettled, resolved with timeouts', assert => {
  return Promise.allSettled([
    Promise.resolve(1),
    new Promise(resolve => setTimeout(() => resolve(2), 10)),
    Promise.resolve(3),
  ]).then(it => {
    assert.deepEqual(it, [
      { value: 1, status: 'fulfilled' },
      { value: 2, status: 'fulfilled' },
      { value: 3, status: 'fulfilled' },
    ], 'keeps correct mapping, even with delays');
  });
});

QUnit.test('Promise.allSettled, subclassing', assert => {
  const { allSettled, resolve } = Promise;
  function SubPromise(executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  }
  SubPromise.resolve = resolve.bind(Promise);
  assert.true(allSettled.call(SubPromise, [1, 2, 3]) instanceof SubPromise, 'subclassing, `this` pattern');

  function FakePromise1() { /* empty */ }
  function FakePromise2(executor) {
    executor(null, () => { /* empty */ });
  }
  function FakePromise3(executor) {
    executor(() => { /* empty */ }, null);
  }
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = resolve.bind(Promise);
  assert.throws(() => {
    allSettled.call(FakePromise1, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    allSettled.call(FakePromise2, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    allSettled.call(FakePromise3, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.allSettled, iterables', assert => {
  const iterable = createIterable([1, 2, 3]);
  Promise.allSettled(iterable).catch(() => { /* empty */ });
  assert.true(iterable.received, 'works with iterables: iterator received');
  assert.true(iterable.called, 'works with iterables: next called');
});

QUnit.test('Promise.allSettled, iterables 2', assert => {
  const array = [];
  let done = false;
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- legacy FF case
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return [][Symbol.iterator].call(this);
  };
  Promise.allSettled(array);
  assert.true(done);
});

QUnit.test('Promise.allSettled, iterator closing', assert => {
  const { resolve } = Promise;
  let done = false;
  try {
    Promise.resolve = function () {
      throw new Error();
    };
    Promise.allSettled(createIterable([1, 2, 3], {
      return() {
        done = true;
      },
    })).catch(() => { /* empty */ });
  } catch { /* empty */ }
  Promise.resolve = resolve;
  assert.true(done, 'iteration closing');
});

QUnit.test('Promise.allSettled, without constructor context', assert => {
  const { allSettled } = Promise;
  assert.throws(() => allSettled([]), TypeError, 'Throws if called without a constructor context');
  assert.throws(() => allSettled.call(null, []), TypeError, 'Throws if called with null as this');
});
