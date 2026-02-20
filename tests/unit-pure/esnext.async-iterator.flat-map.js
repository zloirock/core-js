import { createIterator, createIterable } from '../helpers/helpers.js';
import { STRICT, STRICT_THIS } from '../helpers/constants.js';

import AsyncIterator from 'core-js-pure/actual/async-iterator';
import Promise from 'core-js-pure/es/promise';
import Symbol from 'core-js-pure/es/symbol';

QUnit.test('AsyncIterator#flatMap', assert => {
  const { flatMap } = AsyncIterator.prototype;

  assert.isFunction(flatMap);
  assert.arity(flatMap, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'flatMap');

  if (STRICT) {
    assert.throws(() => flatMap.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => flatMap.call(null, () => { /* empty */ }), TypeError);
  }

  assert.throws(() => flatMap.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), null), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), {}), TypeError);

  return flatMap.call(createIterator([1, [], 2, createIterable([3, 4]), [5, 6]]), it => typeof it == 'number' ? [-it] : it).toArray().then(it => {
    assert.arrayEqual(it, [-1, -2, 3, 4, 5, 6], 'basic functionality');
    return flatMap.call(createIterator([1]), function (arg, counter) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(arg, 1, 'argument');
      assert.same(counter, 0, 'counter');
      return [arg];
    }).toArray();
  }).then(() => {
    return flatMap.call(createIterator([1]), () => { throw 42; }).toArray();
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
  });
});

QUnit.test('AsyncIterator#flatMap, inner iterator async close on return', assert => {
  assert.expect(3);
  const async = assert.async();

  let innerReturnAwaited = false;

  const outer = AsyncIterator.from({
    next() {
      return Promise.resolve({ value: [1, 2, 3], done: false });
    },
    return() {
      assert.true(innerReturnAwaited, 'inner return() fully awaited before outer return()');
      return Promise.resolve({ value: undefined, done: true });
    },
    [Symbol.asyncIterator]() { return this; },
  });

  const helper = outer.flatMap(arr => {
    let i = 0;
    return {
      next() {
        return Promise.resolve(i < arr.length
          ? { value: arr[i++], done: false }
          : { value: undefined, done: true });
      },
      return() {
        assert.required('inner return() called');
        return new Promise(resolve => {
          setTimeout(() => {
            innerReturnAwaited = true;
            resolve({ value: undefined, done: true });
          }, 50);
        });
      },
      [Symbol.asyncIterator]() { return this; },
    };
  });

  helper.next().then(first => {
    assert.same(first.value, 1, 'got first value');
    return helper.return();
  }).then(() => {
    async();
  }, () => {
    assert.avoid();
    async();
  });
});

QUnit.test('AsyncIterator#flatMap, return() validates inner return result', assert => {
  assert.expect(1);
  const async = assert.async();

  const outer = AsyncIterator.from({
    next() {
      return Promise.resolve({ value: [1, 2], done: false });
    },
    return() {
      return Promise.resolve({ value: undefined, done: true });
    },
    [Symbol.asyncIterator]() { return this; },
  });

  const helper = outer.flatMap(arr => {
    let i = 0;
    return {
      next() {
        return Promise.resolve(i < arr.length
          ? { value: arr[i++], done: false }
          : { value: undefined, done: true });
      },
      return() {
        return null;
      },
      [Symbol.asyncIterator]() { return this; },
    };
  });

  helper.next().then(() => {
    return helper.return();
  }).then(() => {
    assert.avoid();
    async();
  }, error => {
    assert.true(error instanceof TypeError, 'TypeError when inner return() returns non-object');
    async();
  });
});
