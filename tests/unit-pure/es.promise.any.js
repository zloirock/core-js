import { createIterable } from '../helpers/helpers.js';

import $any from 'core-js-pure/es/promise/any';
import AggregateError from 'core-js-pure/es/aggregate-error';
import bind from 'core-js-pure/es/function/bind';
import getIteratorMethod from 'core-js-pure/es/get-iterator-method';
import Promise from 'core-js-pure/es/promise';
import Symbol from 'core-js-pure/es/symbol';

QUnit.test('Promise.any', assert => {
  assert.isFunction(Promise.any);
  assert.arity(Promise.any, 1);
  assert.true(Promise.any([1, 2, 3]) instanceof Promise, 'returns a promise');
});

QUnit.test('Promise.any, resolved', assert => {
  return Promise.any([
    Promise.resolve(1),
    Promise.reject(2),
    Promise.resolve(3),
  ]).then(it => {
    assert.same(it, 1, 'resolved with a correct value');
  });
});

QUnit.test('Promise.any, rejected #1', assert => {
  return Promise.any([
    Promise.reject(1),
    Promise.reject(2),
    Promise.reject(3),
  ]).then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof AggregateError, 'instanceof AggregateError');
    assert.deepEqual(error.errors, [1, 2, 3], 'rejected with a correct value');
  });
});

QUnit.test('Promise.any, rejected #2', assert => {
  // eslint-disable-next-line promise/valid-params -- required for testing
  return Promise.any().then(() => {
    assert.avoid();
  }, () => {
    assert.required('rejected as expected');
  });
});

QUnit.test('Promise.any, rejected #3', assert => {
  return Promise.any([]).then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof AggregateError, 'instanceof AggregateError');
    assert.deepEqual(error.errors, [], 'rejected with a correct value');
  });
});

QUnit.test('Promise.any, resolved with timeout', assert => {
  return Promise.any([
    new Promise(resolve => setTimeout(() => resolve(1), 50)),
    Promise.resolve(2),
  ]).then(it => {
    assert.same(it, 2, 'resolved with a correct value');
  });
});

QUnit.test('Promise.any, subclassing', assert => {
  const { any, resolve } = Promise;
  function SubPromise(executor) {
    executor(() => { /* empty */ }, () => { /* empty */ });
  }
  SubPromise.resolve = bind(resolve, Promise);
  assert.true(any.call(SubPromise, [1, 2, 3]) instanceof SubPromise, 'subclassing, `this` pattern');

  function FakePromise1() { /* empty */ }
  function FakePromise2(executor) {
    executor(null, () => { /* empty */ });
  }
  function FakePromise3(executor) {
    executor(() => { /* empty */ }, null);
  }
  FakePromise1.resolve = FakePromise2.resolve = FakePromise3.resolve = bind(resolve, Promise);
  assert.throws(() => {
    any.call(FakePromise1, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #1');
  assert.throws(() => {
    any.call(FakePromise2, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #2');
  assert.throws(() => {
    any.call(FakePromise3, [1, 2, 3]);
  }, 'NewPromiseCapability validations, #3');
});

QUnit.test('Promise.any, iterables', assert => {
  const iterable = createIterable([1, 2, 3]);
  Promise.any(iterable).catch(() => { /* empty */ });
  assert.true(iterable.received, 'works with iterables: iterator received');
  assert.true(iterable.called, 'works with iterables: next called');
});

QUnit.test('Promise.any, empty iterables', assert => {
  const array = [];
  let done = false;
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- legacy FF case
  array['@@iterator'] = undefined;
  array[Symbol.iterator] = function () {
    done = true;
    return getIteratorMethod([]).call(this);
  };
  return Promise.any(array).then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof AggregateError, 'instanceof AggregateError');
    assert.true(done, 'iterator called');
  });
});

QUnit.test('Promise.any, iterator closing', assert => {
  const { resolve } = Promise;
  let done = false;
  try {
    Promise.resolve = function () {
      throw new Error();
    };
    Promise.any(createIterable([1, 2, 3], {
      return() {
        done = true;
      },
    })).catch(() => { /* empty */ });
  } catch { /* empty */ }
  Promise.resolve = resolve;
  assert.true(done, 'iteration closing');
});

QUnit.test('Promise.any, without constructor context', assert => {
  const { any } = Promise;
  assert.throws(() => any([]), TypeError, 'Throws if called without a constructor context');
  assert.throws(() => any.call(null, []), TypeError, 'Throws if called with null as this');
});

QUnit.test('Promise.any, method from direct entry, without constructor context', assert => {
  return $any([
    Promise.resolve(1),
    Promise.resolve(2),
  ]).then(it => {
    assert.same(it, 1, 'resolved with a correct value');
  });
});

QUnit.test('Promise.any, method from direct entry, with null context', assert => {
  return $any.call(null, [
    Promise.resolve(1),
    Promise.resolve(2),
  ]).then(it => {
    assert.same(it, 1, 'resolved with a correct value');
  });
});
