import { createIterator } from '../helpers/helpers.js';
import { STRICT, STRICT_THIS } from '../helpers/constants.js';

import AsyncIterator from '@core-js/pure/actual/async-iterator';

QUnit.test('AsyncIterator#some', assert => {
  const { some } = AsyncIterator.prototype;

  assert.isFunction(some);
  assert.arity(some, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'some');

  if (STRICT) {
    assert.throws(() => some.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => some.call(null, () => { /* empty */ }), TypeError);
  }

  assert.throws(() => some.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => some.call(createIterator([1]), null), TypeError);
  assert.throws(() => some.call(createIterator([1]), {}), TypeError);

  return some.call(createIterator([1, 2, 3]), it => it === 2).then(result => {
    assert.true(result, 'basic functionality, +');
    return some.call(createIterator([1, 2, 3]), it => it === 4);
  }).then(result => {
    assert.false(result, 'basic functionality, -');
    return some.call(createIterator([1]), function (arg, counter) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(arg, 1, 'argument');
      assert.same(counter, 0, 'counter');
    });
  }).then(() => {
    return some.call(createIterator([1]), () => { throw 42; });
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
  });
});
