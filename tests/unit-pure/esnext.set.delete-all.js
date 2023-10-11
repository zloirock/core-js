import from from '@core-js/pure/es/array/from';
import Set from '@core-js/pure/full/set';

QUnit.test('Set#deleteAll', assert => {
  const { deleteAll } = Set.prototype;

  assert.isFunction(deleteAll);
  assert.arity(deleteAll, 0);
  assert.name(deleteAll, 'deleteAll');
  assert.nonEnumerable(Set.prototype, 'deleteAll');

  let set = new Set([1, 2, 3]);
  assert.true(set.deleteAll(1, 2));
  assert.deepEqual(from(set), [3]);

  set = new Set([1, 2, 3]);
  assert.false(set.deleteAll(3, 4));
  assert.deepEqual(from(set), [1, 2]);

  set = new Set([1, 2, 3]);
  assert.false(set.deleteAll(4, 5));
  assert.deepEqual(from(set), [1, 2, 3]);

  set = new Set([1, 2, 3]);
  assert.true(set.deleteAll());
  assert.deepEqual(from(set), [1, 2, 3]);

  assert.throws(() => deleteAll.call({ delete() { /* empty */ } }, 1, 2, 3));
  assert.throws(() => deleteAll.call({}, 1, 2, 3), TypeError);
  assert.throws(() => deleteAll.call(undefined, 1, 2, 3), TypeError);
  assert.throws(() => deleteAll.call(null, 1, 2, 3), TypeError);
});
