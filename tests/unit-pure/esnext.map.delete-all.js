import from from 'core-js-pure/es/array/from';
import Map from 'core-js-pure/full/map';

QUnit.test('Map#deleteAll', assert => {
  const { deleteAll } = Map.prototype;

  assert.isFunction(deleteAll);
  assert.arity(deleteAll, 0);
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
