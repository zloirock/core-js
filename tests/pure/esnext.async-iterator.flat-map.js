import AsyncIterator from 'core-js-pure/full/async-iterator';

import { createIterator, createIterable } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('AsyncIterator#flatMap', assert => {
  assert.expect(15);
  const async = assert.async();
  const { flatMap } = AsyncIterator.prototype;

  assert.isFunction(flatMap);
  assert.arity(flatMap, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'flatMap');

  flatMap.call(createIterator([1, [], 2, createIterable([3, 4]), [5, 6], 'ab']), it => typeof it == 'number' ? [-it] : it).toArray().then(it => {
    assert.arrayEqual(it, [-1, -2, 3, 4, 5, 6, 'a', 'b'], 'basic functionality');
    return flatMap.call(createIterator([1]), function (arg) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 1, 'arguments length');
      assert.same(arg, 1, 'argument');
      return [arg];
    }).toArray();
  }).then(() => {
    return flatMap.call(createIterator([1]), () => { throw 42; }).toArray();
  }).catch(error => {
    assert.same(error, 42, 'rejection on a callback error');
  }).then(() => async());

  assert.throws(() => flatMap.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), null), TypeError);
  assert.throws(() => flatMap.call(createIterator([1]), {}), TypeError);
});
