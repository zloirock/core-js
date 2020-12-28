import { createIterable } from '../helpers/helpers';

import { Promise, Symbol } from 'core-js-pure';
import getIteratorMethod from 'core-js-pure/features/get-iterator-method';

QUnit.test('Promise.race', assert => {
  const { race, resolve } = Promise;
  assert.isFunction(race);
  assert.arity(race, 1);
  const iterable = createIterable([1, 2, 3]);
  Promise.race(iterable).catch(() => { /* empty */ });
  assert.ok(iterable.received, 'works with iterables: iterator received');
  assert.ok(iterable.called, 'works with iterables: next called');
  const array = [];
  let done = false;
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return getIteratorMethod([]).call(this);
  };
  Promise.race(array);
  assert.ok(done);
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
  } catch (error) { /* empty */ }
  Promise.resolve = resolve;
  assert.ok(done, 'iteration closing');
  let FakePromise1 = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  let FakePromise2 = FakePromise1[Symbol.species] = function (executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  };
  FakePromise1.resolve = FakePromise2.resolve = Promise.resolve.bind(Promise);
  assert.ok(race.call(FakePromise1, [1, 2, 3]) instanceof FakePromise1, 'subclassing, `this` pattern');
  FakePromise1 = function () { /* empty */ };
  FakePromise2 = function (executor) {
    executor(null, () => { /* empty */ });
  };
  const FakePromise3 = function (executor) {
    executor(() => { /* empty */ }, null);
  };
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = Promise.resolve.bind(Promise);
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
