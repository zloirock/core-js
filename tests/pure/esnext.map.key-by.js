import { createIterable } from '../helpers/helpers';

import Map from 'core-js-pure/full/map';
import toArray from 'core-js-pure/full/array/from';

QUnit.test('Map.keyBy', assert => {
  const { keyBy } = Map;

  assert.isFunction(keyBy);
  assert.arity(keyBy, 2);
  assert.name(keyBy, 'keyBy');

  assert.ok(Map.keyBy([], it => it) instanceof Map);

  assert.deepEqual(toArray(Map.keyBy([], it => it)), []);
  assert.deepEqual(toArray(Map.keyBy([1, 2], it => it ** 2)), [[1, 1], [4, 2]]);
  assert.deepEqual(toArray(Map.keyBy([1, 2, 1], it => it ** 2)), [[1, 1], [4, 2]]);
  assert.deepEqual(toArray(Map.keyBy(createIterable([1, 2]), it => it ** 2)), [[1, 1], [4, 2]]);

  const element = {};
  Map.keyBy([element], it => assert.same(it, element));

  assert.throws(() => keyBy([1, 2], it => it));
});
