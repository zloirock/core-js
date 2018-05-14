QUnit.test('Set#deleteAll', assert => {
  const { deleteAll } = Set.prototype;
  const { from } = Array;

  assert.isFunction(deleteAll);
  assert.arity(deleteAll, 0);
  assert.name(deleteAll, 'deleteAll');
  assert.looksNative(deleteAll);
  assert.nonEnumerable(Set.prototype, 'deleteAll');

  let set = new Set([1, 2, 3]);
  assert.same(set.deleteAll(1, 2), true);
  assert.deepEqual(from(set), [3]);

  set = new Set([1, 2, 3]);
  assert.same(set.deleteAll(3, 4), false);
  assert.deepEqual(from(set), [1, 2]);

  set = new Set([1, 2, 3]);
  assert.same(set.deleteAll(4, 5), false);
  assert.deepEqual(from(set), [1, 2, 3]);

  set = new Set([1, 2, 3]);
  assert.same(set.deleteAll(), true);
  assert.deepEqual(from(set), [1, 2, 3]);

  assert.notThrows(() => !deleteAll.call({ delete() { /* empty */ } }, 1, 2, 3));
  assert.throws(() => deleteAll.call({}, 1, 2, 3), TypeError);
  assert.throws(() => deleteAll.call(undefined, 1, 2, 3), TypeError);
  assert.throws(() => deleteAll.call(null, 1, 2, 3), TypeError);
});
