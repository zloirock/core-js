import { createIterable } from '../helpers/helpers.js';

import from from '@core-js/pure/es/array/from';
import Map from '@core-js/pure/es/map';

QUnit.test('Map.groupBy', assert => {
  const { groupBy } = Map;

  assert.isFunction(groupBy);
  assert.arity(groupBy, 2);
  assert.name(groupBy, 'groupBy');

  assert.true(groupBy([], it => it) instanceof Map);

  assert.deepEqual(from(groupBy([], it => it)), []);
  assert.deepEqual(from(groupBy([1, 2], it => it ** 2)), [[1, [1]], [4, [2]]]);
  assert.deepEqual(from(groupBy([1, 2, 1], it => it ** 2)), [[1, [1, 1]], [4, [2]]]);
  assert.deepEqual(from(groupBy(createIterable([1, 2]), it => it ** 2)), [[1, [1]], [4, [2]]]);
  assert.deepEqual(from(groupBy('qwe', it => it)), [['q', ['q']], ['w', ['w']], ['e', ['e']]], 'iterable string');

  const element = {};
  groupBy([element], function (it, i) {
    assert.same(arguments.length, 2);
    assert.same(it, element);
    assert.same(i, 0);
  });
});
