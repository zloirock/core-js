import { createIterable } from '../helpers/helpers.js';

QUnit.test('Map.groupBy', assert => {
  const { groupBy } = Map;
  const toArray = Array.from;

  assert.isFunction(groupBy);
  assert.arity(groupBy, 2);
  assert.name(groupBy, 'groupBy');
  assert.looksNative(groupBy);
  assert.nonEnumerable(Map, 'groupBy');

  assert.true(Map.groupBy([], it => it) instanceof Map);

  assert.deepEqual(toArray(groupBy([], it => it)), []);
  assert.deepEqual(toArray(groupBy([1, 2], it => it ** 2)), [[1, [1]], [4, [2]]]);
  assert.deepEqual(toArray(groupBy([1, 2, 1], it => it ** 2)), [[1, [1, 1]], [4, [2]]]);
  assert.deepEqual(toArray(groupBy(createIterable([1, 2]), it => it ** 2)), [[1, [1]], [4, [2]]]);
  assert.deepEqual(toArray(groupBy('qwe', it => it)), [['q', ['q']], ['w', ['w']], ['e', ['e']]], 'iterable string');

  const element = {};
  groupBy([element], function (it, i) {
    assert.same(arguments.length, 2, 'correct number of callback arguments');
    assert.same(it, element, 'correct value in callback');
    assert.same(i, 0, 'correct index in callback');
  });
});
