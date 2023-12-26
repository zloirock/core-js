import { createIterable } from '../helpers/helpers.js';

QUnit.test('Map.from', assert => {
  const { from } = Map;
  const toArray = Array.from;
  assert.isFunction(from);
  assert.arity(from, 1);
  assert.name(from, 'from');
  assert.looksNative(from);
  assert.nonEnumerable(Map, 'from');
  assert.true(from([]) instanceof Map);
  assert.deepEqual(toArray(from([])), []);
  assert.deepEqual(toArray(from([[1, 2]])), [[1, 2]]);
  assert.deepEqual(toArray(from([[1, 2], [2, 3], [1, 4]])), [[1, 4], [2, 3]]);
  assert.deepEqual(toArray(from(createIterable([[1, 2], [2, 3], [1, 4]]))), [[1, 4], [2, 3]]);
  const pair = [1, 2];
  const context = {};
  from([pair], function (element, index) {
    assert.same(element, pair);
    assert.same(index, 0);
    assert.same(this, context);
    return element;
  }, context);
});
