import { createIterable } from '../helpers/helpers';

QUnit.test('Map.groupBy', assert => {
  const { groupBy } = Map;
  const toArray = Array.from;

  assert.isFunction(groupBy);
  assert.arity(groupBy, 2);
  assert.name(groupBy, 'groupBy');
  assert.looksNative(groupBy);
  assert.nonEnumerable(Map, 'groupBy');

  assert.ok(groupBy([], it => it) instanceof Map);

  assert.deepEqual(toArray(groupBy([], it => it)), []);
  assert.deepEqual(toArray(groupBy([1, 2], it => it ** 2)), [[1, [1]], [4, [2]]]);
  assert.deepEqual(toArray(groupBy([1, 2, 1], it => it ** 2)), [[1, [1, 1]], [4, [2]]]);
  assert.deepEqual(toArray(groupBy(createIterable([1, 2]), it => it ** 2)), [[1, [1]], [4, [2]]]);

  const element = {};
  groupBy([element], it => assert.same(it, element));
});
