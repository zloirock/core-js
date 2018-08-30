QUnit.test('Map#merge', assert => {
  const { merge } = Map.prototype;
  const { from } = Array;

  assert.isFunction(merge);
  assert.arity(merge, 1);
  assert.name(merge, 'merge');
  assert.looksNative(merge);
  assert.nonEnumerable(Map.prototype, 'merge');

  const map = new Map([[1, 2]]);
  const result = map.merge([[3, 4]]);
  assert.ok(result !== map);
  assert.ok(result instanceof Map);

  assert.deepEqual(from(new Map([[1, 2], [3, 4]]).merge([[5, 6]])), [[1, 2], [3, 4], [5, 6]]);
  assert.deepEqual(from(new Map([[1, 2], [3, 4]]).merge([[3, 5], [5, 6]])), [[1, 2], [3, 5], [5, 6]]);
  assert.deepEqual(from(new Map([[1, 2], [3, 4]]).merge([])), [[1, 2], [3, 4]]);

  assert.throws(() => merge.call({}, [[1, 2]]), TypeError);
  assert.throws(() => merge.call(undefined, [[1, 2]]), TypeError);
  assert.throws(() => merge.call(null, [[1, 2]]), TypeError);
});
