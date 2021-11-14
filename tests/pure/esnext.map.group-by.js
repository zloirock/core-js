import { createIterable } from '../helpers/helpers';

import from from 'core-js-pure/es/array/from';
import Map from 'core-js-pure/features/map';

QUnit.test('Map.groupBy', assert => {
  const { groupBy } = Map;

  assert.isFunction(groupBy);
  assert.arity(groupBy, 2);
  assert.name(groupBy, 'groupBy');

  assert.true(Map.groupBy([], it => it) instanceof Map);

  assert.deepEqual(from(Map.groupBy([], it => it)), []);
  assert.deepEqual(from(Map.groupBy([1, 2], it => it ** 2)), [[1, [1]], [4, [2]]]);
  assert.deepEqual(from(Map.groupBy([1, 2, 1], it => it ** 2)), [[1, [1, 1]], [4, [2]]]);
  assert.deepEqual(from(Map.groupBy(createIterable([1, 2]), it => it ** 2)), [[1, [1]], [4, [2]]]);

  const element = {};
  Map.groupBy([element], it => assert.same(it, element));

  assert.throws(() => groupBy([1, 2], it => it));
});
