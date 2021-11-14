import { createAsyncIterable, createIterable } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

import Promise from 'core-js-pure/es/promise';
import fromAsync from 'core-js-pure/features/array/from-async';

QUnit.test('Array.fromAsync', assert => {
  assert.expect(25);
  const async = assert.async();

  assert.isFunction(fromAsync);
  assert.arity(fromAsync, 1);
  assert.name(fromAsync, 'fromAsync');

  function C() { /* empty */ }

  fromAsync(createAsyncIterable([1, 2, 3]), it => it ** 2).then(it => {
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
  }).catch(error => {
    assert.same(error, 42, 'rejection on a callback error');
    return fromAsync(undefined, () => { /* empty */ });
  }).catch(error => {
    assert.true(error instanceof TypeError);
    return fromAsync(null, () => { /* empty */ });
  }).catch(error => {
    assert.true(error instanceof TypeError);
    return fromAsync([1], null);
  }).catch(error => {
    assert.true(error instanceof TypeError);
    return fromAsync([1], {});
  }).catch(error => {
    assert.true(error instanceof TypeError);
    async();
  });
});
