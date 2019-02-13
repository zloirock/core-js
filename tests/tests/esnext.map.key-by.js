import { createIterable } from '../helpers/helpers';

QUnit.test('Map.keyBy', assert => {
  const { keyBy } = Map;
  const toArray = Array.from;

  assert.isFunction(keyBy);
  assert.arity(keyBy, 2);
  assert.name(keyBy, 'keyBy');
  assert.looksNative(keyBy);
  assert.nonEnumerable(Map, 'keyBy');

  assert.ok(Map.keyBy([], it => it) instanceof Map);

  assert.deepEqual(toArray(Map.keyBy([], it => it)), []);
  assert.deepEqual(toArray(Map.keyBy([1, 2], it => it ** 2)), [[1, 1], [4, 2]]);
  assert.deepEqual(toArray(Map.keyBy([1, 2, 1], it => it ** 2)), [[1, 1], [4, 2]]);
  assert.deepEqual(toArray(Map.keyBy(createIterable([1, 2]), it => it ** 2)), [[1, 1], [4, 2]]);

  const element = {};
  Map.keyBy([element], it => assert.same(it, element));

  assert.throws(() => keyBy([1, 2], it => it));
});
