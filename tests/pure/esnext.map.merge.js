import Map from 'core-js-pure/features/map';
import from from 'core-js-pure/features/array/from';

QUnit.test('Map#merge', assert => {
  const { merge } = Map.prototype;

  assert.isFunction(merge);
  assert.arity(merge, 1);
  if ('name' in merge) assert.name(merge, 'merge');
  assert.nonEnumerable(Map.prototype, 'merge');

  const map = new Map([[1, 2]]);
  assert.same(map.merge([[3, 4]]), map);

  assert.deepEqual(from(new Map([[1, 2], [3, 4]]).merge([[5, 6]])), [[1, 2], [3, 4], [5, 6]]);
  assert.deepEqual(from(new Map([[1, 2], [3, 4]]).merge([[3, 5], [5, 6]])), [[1, 2], [3, 5], [5, 6]]);
  assert.deepEqual(from(new Map([[1, 2], [3, 4]]).merge([])), [[1, 2], [3, 4]]);

  assert.notThrows(() => merge.call({ set() { /* empty */ } }, [[1, 2]]));
  assert.throws(() => merge.call({}, [[1, 2]]), TypeError);
  assert.throws(() => merge.call(undefined, [[1, 2]]), TypeError);
  assert.throws(() => merge.call(null, [[1, 2]]), TypeError);
});
