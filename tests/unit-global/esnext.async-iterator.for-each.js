import { createIterator } from '../helpers/helpers.js';
import { STRICT, STRICT_THIS } from '../helpers/constants.js';

QUnit.test('AsyncIterator#forEach', assert => {
  const { forEach } = AsyncIterator.prototype;

  assert.isFunction(forEach);
  assert.arity(forEach, 1);
  assert.name(forEach, 'forEach');
  assert.looksNative(forEach);
  assert.nonEnumerable(AsyncIterator.prototype, 'forEach');

  if (STRICT) {
    assert.throws(() => forEach.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => forEach.call(null, () => { /* empty */ }), TypeError);
  }

  assert.throws(() => forEach.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => forEach.call(createIterator([1]), null), TypeError);
  assert.throws(() => forEach.call(createIterator([1]), {}), TypeError);

  const array = [];
  const counters = [];

  return forEach.call(createIterator([1, 2, 3]), it => array.push(it)).then(() => {
    assert.arrayEqual(array, [1, 2, 3], 'basic functionality');
    return forEach.call(createIterator([1, 2, 3]), (value, counter) => counters.push(counter));
  }).then(() => {
    assert.arrayEqual(counters, [0, 1, 2], 'counter incremented');
    return forEach.call(createIterator([1]), function (arg, counter) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(arg, 1, 'argument');
      assert.same(counter, 0, 'counter');
    });
  }).then(() => {
    return forEach.call(createIterator([1]), () => { throw 42; });
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
  }).then(() => {
    return forEach.call(
      createIterator([1], { return() { throw 43; } }),
      () => { throw 42; },
    );
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error even if return() throws');
  });
});
