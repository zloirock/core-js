import { createIterator } from '../helpers/helpers.js';

import AsyncIterator from '@core-js/pure/actual/async-iterator';

QUnit.test('AsyncIterator#filter', assert => {
  const { filter } = AsyncIterator.prototype;

  assert.isFunction(filter);
  assert.arity(filter, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'filter');

  assert.throws(() => filter.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => filter.call(null, () => { /* empty */ }), TypeError);

  assert.throws(() => filter.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => filter.call(createIterator([1]), null), TypeError);
  assert.throws(() => filter.call(createIterator([1]), {}), TypeError);

  const counters = [];

  return filter.call(createIterator([1, 2, 3]), it => it % 2).toArray().then(it => {
    assert.arrayEqual(it, [1, 3], 'basic functionality');
    return filter.call(createIterator([1, 2, 3]), (value, counter) => {
      counters.push(counter);
      return value;
    }).toArray();
  }).then(() => {
    assert.arrayEqual(counters, [0, 1, 2], 'counter incremented');
    return filter.call(createIterator([1]), function (arg, counter) {
      assert.same(this, undefined, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(arg, 1, 'argument');
      assert.same(counter, 0, 'counter');
    }).toArray();
  }).then(() => {
    return filter.call(createIterator([1]), () => { throw 42; }).toArray();
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
  });
});
