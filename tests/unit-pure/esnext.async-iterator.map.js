import { createIterator } from '../helpers/helpers.js';
import { STRICT, STRICT_THIS } from '../helpers/constants.js';

import AsyncIterator from 'core-js-pure/actual/async-iterator';

QUnit.test('AsyncIterator#map', assert => {
  const { map } = AsyncIterator.prototype;

  assert.isFunction(map);
  assert.arity(map, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'map');

  if (STRICT) {
    assert.throws(() => map.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => map.call(null, () => { /* empty */ }), TypeError);
  }

  assert.throws(() => map.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => map.call(createIterator([1]), null), TypeError);
  assert.throws(() => map.call(createIterator([1]), {}), TypeError);

  const counters = [];

  return map.call(createIterator([1, 2, 3]), it => it ** 2).toArray().then(it => {
    assert.arrayEqual(it, [1, 4, 9], 'basic functionality');
    return map.call(createIterator([1, 2, 3]), (value, counter) => {
      counters.push(counter);
      return value;
    }).toArray();
  }).then(() => {
    assert.arrayEqual(counters, [0, 1, 2], 'counter incremented');
    return map.call(createIterator([1]), function (arg, counter) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(arg, 1, 'argument');
      assert.same(counter, 0, 'counter');
    }).toArray();
  }).then(() => {
    return map.call(createIterator([1]), () => { throw 42; }).toArray();
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
  }).then(() => {
    let calls = 0;
    const iterator = createIterator([1, 2, 3], {
      next() { calls++; throw 43; },
    });
    const mapped = map.call(iterator, it => it);
    return mapped.next().then(() => {
      assert.avoid();
    }, error => {
      assert.same(error, 43, 'rejection on next() sync error');
      assert.same(calls, 1, 'next() called once');
      return mapped.next();
    }).then(result => {
      assert.true(result.done, 'done after next() sync error');
      assert.same(calls, 1, 'next() not called again after sync error');
    });
  });
});
