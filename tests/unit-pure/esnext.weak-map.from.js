import { createIterable } from '../helpers/helpers.js';

import WeakMap from '@core-js/pure/full/weak-map';

QUnit.test('WeakMap.from', assert => {
  const { from } = WeakMap;
  assert.isFunction(from);
  assert.arity(from, 1);
  assert.true(from([]) instanceof WeakMap);
  const array = [];
  assert.same(from([[array, 2]]).get(array), 2);
  assert.same(from(createIterable([[array, 2]])).get(array), 2);
  const pair = [{}, 1];
  const context = {};
  from([pair], function (element, index) {
    assert.same(element, pair);
    assert.same(index, 0);
    assert.same(this, context);
    return element;
  }, context);
});
