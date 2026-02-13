import { createIterator } from '../helpers/helpers.js';
import { STRICT, STRICT_THIS } from '../helpers/constants.js';

import AsyncIterator from 'core-js-pure/actual/async-iterator';

QUnit.test('AsyncIterator#find', assert => {
  const { find } = AsyncIterator.prototype;

  assert.isFunction(find);
  assert.arity(find, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'find');

  if (STRICT) {
    assert.throws(() => find.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => find.call(null, () => { /* empty */ }), TypeError);
  }

  assert.throws(() => find.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => find.call(createIterator([1]), null), TypeError);
  assert.throws(() => find.call(createIterator([1]), {}), TypeError);

  const counters = [];

  return find.call(createIterator([2, 3, 4]), it => it % 2).then(result => {
    assert.same(result, 3, 'basic functionality, +');
    return find.call(createIterator([1, 2, 3]), it => it === 4);
  }).then(result => {
    assert.same(result, undefined, 'basic functionality, -');
    return find.call(createIterator([1, 2, 3]), (value, counter) => {
      counters.push(counter);
      return false;
    });
  }).then(() => {
    assert.arrayEqual(counters, [0, 1, 2], 'counter incremented');
    return find.call(createIterator([1]), function (arg, counter) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(arg, 1, 'argument');
      assert.same(counter, 0, 'counter');
    });
  }).then(() => {
    return find.call(createIterator([1]), () => { throw 42; });
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
  }).then(() => {
    return find.call(
      createIterator([1], { return() { throw 43; } }),
      () => { throw 42; },
    );
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error even if return() throws');
  });
});
