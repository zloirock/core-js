import { createIterable } from '../helpers/helpers.js';

import WeakSet from '@core-js/pure/full/weak-set';

QUnit.test('WeakSet.from', assert => {
  const { from } = WeakSet;
  assert.isFunction(from);
  assert.arity(from, 1);
  assert.true(from([]) instanceof WeakSet);
  const array = [];
  assert.true(from([array]).has(array));
  assert.true(from(createIterable([array])).has(array));
  const object = {};
  const context = {};
  from([object], function (element, index) {
    assert.same(element, object);
    assert.same(index, 0);
    assert.same(this, context);
    return element;
  }, context);
});
