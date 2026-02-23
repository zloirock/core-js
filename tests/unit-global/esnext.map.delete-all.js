QUnit.test('Map#deleteAll', assert => {
  const { deleteAll } = Map.prototype;
  const { from } = Array;

  assert.isFunction(deleteAll);
  assert.arity(deleteAll, 0);
  assert.name(deleteAll, 'deleteAll');
  assert.looksNative(deleteAll);
  assert.nonEnumerable(Map.prototype, 'deleteAll');

  let map = new Map([[1, 2], [2, 3], [3, 4]]);
  assert.true(map.deleteAll(1, 2));
  assert.deepEqual(from(map), [[3, 4]]);

  map = new Map([[1, 2], [2, 3], [3, 4]]);
  assert.false(map.deleteAll(3, 4));
  assert.deepEqual(from(map), [[1, 2], [2, 3]]);

  map = new Map([[1, 2], [2, 3], [3, 4]]);
  assert.false(map.deleteAll(4, 5));
  assert.deepEqual(from(map), [[1, 2], [2, 3], [3, 4]]);

  map = new Map([[1, 2], [2, 3], [3, 4]]);
  assert.true(map.deleteAll());
  assert.deepEqual(from(map), [[1, 2], [2, 3], [3, 4]]);

  assert.throws(() => deleteAll.call({ delete() { /* empty */ } }, 1, 2, 3));
  assert.throws(() => deleteAll.call({}, 1, 2, 3), TypeError);
  assert.throws(() => deleteAll.call(undefined, 1, 2, 3), TypeError);
  assert.throws(() => deleteAll.call(null, 1, 2, 3), TypeError);
});
