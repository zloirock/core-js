import { createIterator, createIterable } from '../helpers/helpers.js';

QUnit.test('AsyncIterator#flatMap', assert => {
  const { flatMap } = AsyncIterator.prototype;

  assert.isFunction(flatMap);
  assert.arity(flatMap, 1);
  assert.name(flatMap, 'flatMap');
  assert.looksNative(flatMap);
  assert.nonEnumerable(AsyncIterator.prototype, 'flatMap');

  assert.throws(() => flatMap.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call(null, () => { /* empty */ }), TypeError);

  assert.throws(() => flatMap.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), null), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), {}), TypeError);

  return flatMap.call(createIterator([1, [], 2, createIterable([3, 4]), [5, 6]]), it => typeof it == 'number' ? [-it] : it).toArray().then(it => {
    assert.arrayEqual(it, [-1, -2, 3, 4, 5, 6], 'basic functionality');
    return flatMap.call(createIterator([1]), function (arg, counter) {
      assert.same(this, undefined, 'this');
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
