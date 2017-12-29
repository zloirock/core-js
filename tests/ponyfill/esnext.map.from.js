import { createIterable } from '../helpers/helpers';

import Map from '../../ponyfill/fn/map';
import toArray from '../../ponyfill/fn/array/from';

QUnit.test('Map.from', assert => {
  const { from } = Map;
  assert.isFunction(from);
  assert.arity(from, 1);
  assert.ok(Map.from() instanceof Map);
  assert.deepEqual(toArray(Map.from([])), []);
  assert.deepEqual(toArray(Map.from([[1, 2]])), [[1, 2]]);
  assert.deepEqual(toArray(Map.from([[1, 2], [2, 3], [1, 4]])), [[1, 4], [2, 3]]);
  assert.deepEqual(toArray(Map.from(createIterable([[1, 2], [2, 3], [1, 4]]))), [[1, 4], [2, 3]]);
  const pair = [1, 2];
  const context = {};
  Map.from([pair], function (element, index) {
    assert.same(element, pair);
    assert.same(index, 0);
    assert.same(this, context);
    return element;
  }, context);
  assert.throws(() => from([1, 2]));
  let arg = null;
  function F(it) {
    return arg = it;
  }
  from.call(F, createIterable([1, 2, 3]), it => it ** 2);
  assert.deepEqual(arg, [1, 4, 9]);
});
