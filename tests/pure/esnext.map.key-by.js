import { createIterable } from '../helpers/helpers';

import Map from 'core-js-pure/features/map';
import toArray from 'core-js-pure/features/array/from';

QUnit.test('Map.keyBy', assert => {
  const { keyBy } = Map;

  assert.isFunction(keyBy);
  assert.arity(keyBy, 2);
  if ('name' in keyBy) assert.name(keyBy, 'keyBy');

  assert.ok(keyBy([], it => it) instanceof Map);

  assert.deepEqual(toArray(keyBy([], it => it)), []);
  assert.deepEqual(toArray(keyBy([1, 2], it => it ** 2)), [[1, 1], [4, 2]]);
  assert.deepEqual(toArray(keyBy([1, 2, 1], it => it ** 2)), [[1, 1], [4, 2]]);
  assert.deepEqual(toArray(keyBy(createIterable([1, 2]), it => it ** 2)), [[1, 1], [4, 2]]);

  const element = {};
  keyBy([element], it => assert.same(it, element));
});
