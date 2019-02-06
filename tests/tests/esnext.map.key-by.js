import { createIterable } from '../helpers/helpers';

QUnit.test('Map.keyBy', assert => {
  const { keyBy } = Map;
  const toArray = Array.from;

  assert.isFunction(keyBy);
  assert.arity(keyBy, 2);
  assert.name(keyBy, 'keyBy');
  assert.looksNative(keyBy);
  assert.nonEnumerable(Map, 'keyBy');

  assert.ok(keyBy([], it => it) instanceof Map);

  assert.deepEqual(toArray(keyBy([], it => it)), []);
  assert.deepEqual(toArray(keyBy([1, 2], it => it ** 2)), [[1, 1], [4, 2]]);
  assert.deepEqual(toArray(keyBy([1, 2, 1], it => it ** 2)), [[1, 1], [4, 2]]);
  assert.deepEqual(toArray(keyBy(createIterable([1, 2]), it => it ** 2)), [[1, 1], [4, 2]]);

  const element = {};
  keyBy([element], it => assert.same(it, element));
});
