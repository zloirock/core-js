import AsyncIterator from 'core-js-pure/features/async-iterator';

import { createIterator, createIterable } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('AsyncIterator#flatMap', assert => {
  assert.expect(11);
  const async = assert.async();
  const { flatMap } = AsyncIterator.prototype;

  assert.isFunction(flatMap);
  assert.arity(flatMap, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'flatMap');

  flatMap.call(createIterator([1, [], 2, createIterable([3, 4]), [5, 6], 'ab']), it => typeof it == 'number' ? -it : it).toArray().then(it => {
    assert.arrayEqual(it, [-1, -2, 3, 4, 5, 6, 'ab'], 'basic functionality');
    return flatMap.call(createIterator([1]), function (arg) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 1, 'arguments length');
      assert.same(arg, 1, 'argument');
    }).toArray();
  }).then(() => async());

  assert.throws(() => flatMap.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => flatMap.call([], () => { /* empty */ }), TypeError);
});
