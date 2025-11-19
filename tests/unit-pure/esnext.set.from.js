import { createIterable } from '../helpers/helpers.js';

import toArray from '@core-js/pure/es/array/from';
import Set from '@core-js/pure/full/set';

QUnit.test('Set.from', assert => {
  const { from } = Set;
  assert.isFunction(from);
  assert.arity(from, 1);
  assert.true(from([]) instanceof Set);
  assert.deepEqual(toArray(from([])), []);
  assert.deepEqual(toArray(from([1])), [1]);
  assert.deepEqual(toArray(from([1, 2, 3, 2, 1])), [1, 2, 3]);
  assert.deepEqual(toArray(from(createIterable([1, 2, 3, 2, 1]))), [1, 2, 3]);
  const context = {};
  from([1], function (element, index) {
    assert.same(element, 1);
    assert.same(index, 0);
    assert.same(this, context);
    return element;
  }, context);
});
