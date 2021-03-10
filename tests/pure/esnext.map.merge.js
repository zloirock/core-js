import Map from 'core-js-pure/full/map';
import from from 'core-js-pure/full/array/from';

QUnit.test('Map#merge', assert => {
  const { merge } = Map.prototype;

  assert.isFunction(merge);
  assert.arity(merge, 1);
  assert.name(merge, 'merge');
  assert.nonEnumerable(Map.prototype, 'merge');

  const map = new Map([[1, 2]]);
  const result = map.merge([[3, 4]]);
  assert.ok(result === map);
  assert.ok(result instanceof Map);

  assert.deepEqual(from(new Map([[1, 2], [3, 4]]).merge([[5, 6]])), [[1, 2], [3, 4], [5, 6]]);
  assert.deepEqual(from(new Map([[1, 2], [3, 4]]).merge([[3, 5], [5, 6]])), [[1, 2], [3, 5], [5, 6]]);
  assert.deepEqual(from(new Map([[1, 2], [3, 4]]).merge([])), [[1, 2], [3, 4]]);

  assert.deepEqual(from(new Map([[1, 2], [3, 4]]).merge([[3, 5]], [[5, 6]])), [[1, 2], [3, 5], [5, 6]]);

  assert.throws(() => merge.call({}, [[1, 2]]), TypeError);
  assert.throws(() => merge.call(undefined, [[1, 2]]), TypeError);
  assert.throws(() => merge.call(null, [[1, 2]]), TypeError);
});
