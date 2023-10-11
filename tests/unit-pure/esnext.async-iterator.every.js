import { createIterator } from '../helpers/helpers.js';
import { STRICT, STRICT_THIS } from '../helpers/constants.js';

import AsyncIterator from '@core-js/pure/actual/async-iterator';

QUnit.test('AsyncIterator#every', assert => {
  const { every } = AsyncIterator.prototype;

  assert.isFunction(every);
  assert.arity(every, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'every');

  if (STRICT) {
    assert.throws(() => every.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => every.call(null, () => { /* empty */ }), TypeError);
  }

  assert.throws(() => every.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => every.call(createIterator([1]), null), TypeError);
  assert.throws(() => every.call(createIterator([1]), {}), TypeError);

  return every.call(createIterator([1, 2, 3]), it => typeof it == 'number').then(result => {
    assert.true(result, 'basic functionality, +');
    return every.call(createIterator([1, 2, 3]), it => it === 2);
  }).then(result => {
    assert.false(result, 'basic functionality, -');
    return every.call(createIterator([1]), function (arg, counter) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(arg, 1, 'argument');
      assert.same(counter, 0, 'counter');
    });
  }).then(() => {
    return every.call(createIterator([1]), () => { throw 42; });
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
  });
});
