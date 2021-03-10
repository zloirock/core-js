import Map from 'core-js-pure/full/map';
import from from 'core-js-pure/full/array/from';

QUnit.test('Map#deleteAll', assert => {
  const { deleteAll } = Map.prototype;

  assert.isFunction(deleteAll);
  assert.arity(deleteAll, 0);
  assert.nonEnumerable(Map.prototype, 'deleteAll');

  let set = new Map([[1, 2], [2, 3], [3, 4]]);
  assert.same(set.deleteAll(1, 2), true);
  assert.deepEqual(from(set), [[3, 4]]);

  set = new Map([[1, 2], [2, 3], [3, 4]]);
  assert.same(set.deleteAll(3, 4), false);
  assert.deepEqual(from(set), [[1, 2], [2, 3]]);

  set = new Map([[1, 2], [2, 3], [3, 4]]);
  assert.same(set.deleteAll(4, 5), false);
  assert.deepEqual(from(set), [[1, 2], [2, 3], [3, 4]]);

  set = new Map([[1, 2], [2, 3], [3, 4]]);
  assert.same(set.deleteAll(), true);
  assert.deepEqual(from(set), [[1, 2], [2, 3], [3, 4]]);

  assert.notThrows(() => !deleteAll.call({ delete() { /* empty */ } }, 1, 2, 3));
  assert.throws(() => deleteAll.call({}, 1, 2, 3), TypeError);
  assert.throws(() => deleteAll.call(undefined, 1, 2, 3), TypeError);
  assert.throws(() => deleteAll.call(null, 1, 2, 3), TypeError);
});
