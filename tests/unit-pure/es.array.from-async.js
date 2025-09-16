import { createAsyncIterable, createIterable/* , createIterator */ } from '../helpers/helpers.js';
import { STRICT_THIS } from '../helpers/constants.js';

import Promise from '@core-js/pure/es/promise';
import fromAsync from '@core-js/pure/es/array/from-async';
// import Iterator from '@core-js/pure/es/iterator';

QUnit.test('Array.fromAsync', assert => {
  assert.isFunction(fromAsync);
  assert.arity(fromAsync, 1);
  assert.name(fromAsync, 'fromAsync');

  let counter = 0;
  // eslint-disable-next-line prefer-arrow-callback -- constructor
  fromAsync.call(function () {
    counter++;
    return [];
  }, { length: 0 });

  assert.same(counter, 1, 'proper number of constructor calling');

  function C() { /* empty */ }

  // const closableIterator = createIterator([1], {
  //   return() { this.closed = true; return { value: undefined, done: true }; },
  // });

  return fromAsync(createAsyncIterable([1, 2, 3]), it => it ** 2).then(it => {
    assert.arrayEqual(it, [1, 4, 9], 'async iterable and mapfn');
    return fromAsync(createAsyncIterable([1]), function (arg, index) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(arg, 1, 'argument');
      assert.same(index, 0, 'index');
    });
  }).then(() => {
    return fromAsync(createAsyncIterable([1, 2, 3]));
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3], 'async iterable without mapfn');
    return fromAsync(createIterable([1, 2, 3]), arg => arg ** 2);
  }).then(it => {
    assert.arrayEqual(it, [1, 4, 9], 'iterable and mapfn');
    return fromAsync(createIterable([1, 2, 3]), arg => Promise.resolve(arg ** 2));
  }).then(it => {
    assert.arrayEqual(it, [1, 4, 9], 'iterable and async mapfn');
    return fromAsync(createIterable([1]), function (arg, index) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(arg, 1, 'argument');
      assert.same(index, 0, 'index');
    });
  }).then(() => {
    return fromAsync(createIterable([1, 2, 3]));
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3], 'iterable and without mapfn');
    return fromAsync([1, Promise.resolve(2), 3]);
  }).then(it => {
    assert.arrayEqual(it, [1, 2, 3], 'array');
    return fromAsync('123');
  }).then(it => {
    assert.arrayEqual(it, ['1', '2', '3'], 'string');
    return fromAsync.call(C, [1]);
  }).then(it => {
    assert.true(it instanceof C, 'subclassable');
    return fromAsync({ length: 1, 0: 1 });
  }).then(it => {
    assert.arrayEqual(it, [1], 'non-iterable');
    return fromAsync(createIterable([1]), () => { throw 42; });
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
    return fromAsync(undefined, () => { /* empty */ });
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof TypeError);
    return fromAsync(null, () => { /* empty */ });
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof TypeError);
    return fromAsync([1], null);
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof TypeError);
    return fromAsync([1], {});
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.true(error instanceof TypeError);
  });
  /* Tests are temporarily disabled due to the lack of proper async feature detection in native implementations.
  .then(() => {
    return fromAsync(Iterator.from(closableIterator), () => { throw 42; });
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
    assert.true(closableIterator.closed, 'doesn\'t close sync iterator on promise rejection');
  }); */
});
