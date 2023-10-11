import { createIterable } from '../helpers/helpers.js';

import from from '@core-js/pure/es/array/from';
import Map from '@core-js/pure/full/map';

QUnit.test('Map.keyBy', assert => {
  const { keyBy } = Map;

  assert.isFunction(keyBy);
  assert.arity(keyBy, 2);
  assert.name(keyBy, 'keyBy');

  assert.true(Map.keyBy([], it => it) instanceof Map);

  assert.deepEqual(from(Map.keyBy([], it => it)), []);
  assert.deepEqual(from(Map.keyBy([1, 2], it => it ** 2)), [[1, 1], [4, 2]]);
  assert.deepEqual(from(Map.keyBy([1, 2, 1], it => it ** 2)), [[1, 1], [4, 2]]);
  assert.deepEqual(from(Map.keyBy(createIterable([1, 2]), it => it ** 2)), [[1, 1], [4, 2]]);

  const element = {};
  Map.keyBy([element], it => assert.same(it, element));

  // assert.throws(() => keyBy([1, 2], it => it));
});
