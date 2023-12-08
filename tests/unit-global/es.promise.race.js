import { createIterable } from '../helpers/helpers.js';

QUnit.test('Promise.race', assert => {
  const { race } = Promise;
  assert.isFunction(race);
  assert.arity(race, 1);
  assert.name(race, 'race');
  assert.looksNative(race);
  assert.nonEnumerable(Promise, 'race');
  assert.true(Promise.race([]) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise.race, resolved', assert => {
  return Promise.race([
    Promise.resolve(1),
    Promise.resolve(2),
  ]).then(it => {
    assert.same(it, 1, 'resolved with a correct value');
  });
});

QUnit.test('Promise.race, resolved with rejection', assert => {
  return Promise.race([
    Promise.reject(1),
    Promise.resolve(2),
  ]).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 1, 'rejected with a correct value');
  });
});

QUnit.test('Promise.race, resolved with timeouts', assert => {
  return Promise.race([
    new Promise(resolve => setTimeout(() => resolve(1), 50)),
    Promise.resolve(2),
  ]).then(it => {
    assert.same(it, 2, 'keeps correct mapping, even with delays');
  });
});

QUnit.test('Promise.race, subclassing', assert => {
  const { race, resolve } = Promise;
  function SubPromise(executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  }
  SubPromise.resolve = resolve.bind(Promise);
  assert.true(race.call(SubPromise, [1, 2, 3]) instanceof SubPromise, 'subclassing, `this` pattern');

  function FakePromise1() { /* empty */ }
  function FakePromise2(executor) {
    executor(null, () => { /* empty */ });
  }
  function FakePromise3(executor) {
    executor(() => { /* empty */ }, null);
  }
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = resolve.bind(Promise);
  assert.throws(() => {
    race.call(FakePromise1, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    race.call(FakePromise2, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    race.call(FakePromise3, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.race, iterables', assert => {
  const iterable = createIterable([1, 2, 3]);
  Promise.race(iterable).catch(() => { /* empty */ });
  assert.true(iterable.received, 'works with iterables: iterator received');
  assert.true(iterable.called, 'works with iterables: next called');
});

QUnit.test('Promise.race, iterables 2', assert => {
  const array = [];
  let done = false;
  array[Symbol.iterator] = function () {
    done = true;
    return [][Symbol.iterator].call(this);
  };
  Promise.race(array);
  assert.true(done);
});

QUnit.test('Promise.race, iterator closing', assert => {
  const { resolve } = Promise;
  let done = false;
  try {
    Promise.resolve = function () {
      throw new Error();
    };
    Promise.race(createIterable([1, 2, 3], {
      return() {
        done = true;
      },
    })).catch(() => { /* empty */ });
  } catch { /* empty */ }
  Promise.resolve = resolve;
  assert.true(done, 'iteration closing');
});

QUnit.test('Promise.race, without constructor context', assert => {
  const { race } = Promise;
  assert.throws(() => race([]), TypeError, 'Throws if called without a constructor context');
  assert.throws(() => race.call(null, []), TypeError, 'Throws if called with null as this');
});
