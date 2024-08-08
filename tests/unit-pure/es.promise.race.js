import { createIterable } from '../helpers/helpers.js';
import getIteratorMethod from '@core-js/pure/es/get-iterator-method';

import Promise from '@core-js/pure/es/promise';
import Symbol from '@core-js/pure/es/symbol';

QUnit.test('Promise.race', assert => {
  const { race, resolve } = Promise;
  assert.isFunction(race);
  assert.arity(race, 1);
  const iterable = createIterable([1, 2, 3]);
  Promise.race(iterable).catch(() => { /* empty */ });
  assert.true(iterable.received, 'works with iterables: iterator received');
  assert.true(iterable.called, 'works with iterables: next called');
  const array = [];
  let done = false;
  array[Symbol.iterator] = function () {
    done = true;
    return getIteratorMethod([]).call(this);
  };
  Promise.race(array);
  assert.true(done);
  assert.throws(() => {
    race.call(null, []).catch(() => { /* empty */ });
  }, TypeError, 'throws without context');
  done = false;
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
  let FakePromise1 = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  let FakePromise2 = FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  FakePromise1.resolve = FakePromise2.resolve = resolve.bind(Promise);
  assert.true(race.call(FakePromise1, [1, 2, 3]) instanceof FakePromise1, 'subclassing, `this` pattern');
  FakePromise1 = function () { /* empty */ };
  FakePromise2 = function (executor) {
    executor(null, () => { /* empty */ });
  };
  const FakePromise3 = function (executor) {
    executor(() => { /* empty */ }, null);
  };
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
