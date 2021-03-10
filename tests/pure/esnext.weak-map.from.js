import { createIterable } from '../helpers/helpers';

import WeakMap from 'core-js-pure/full/weak-map';

QUnit.test('WeakMap.from', assert => {
  const { from } = WeakMap;
  assert.isFunction(from);
  assert.arity(from, 1);
  assert.ok(WeakMap.from() instanceof WeakMap);
  const array = [];
  assert.same(WeakMap.from([[array, 2]]).get(array), 2);
  assert.same(WeakMap.from(createIterable([[array, 2]])).get(array), 2);
  const pair = [{}, 1];
  const context = {};
  WeakMap.from([pair], function (element, index) {
    assert.same(element, pair);
    assert.same(index, 0);
    assert.same(this, context);
    return element;
  }, context);
  assert.throws(() => from([{}, 1]));
  let arg = null;
  function F(it) {
    return arg = it;
  }
  from.call(F, createIterable([1, 2, 3]), it => it ** 2);
  assert.deepEqual(arg, [1, 4, 9]);
});
