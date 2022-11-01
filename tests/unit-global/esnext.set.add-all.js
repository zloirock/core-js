QUnit.test('Set#addAll', assert => {
  const { addAll } = Set.prototype;
  const { from } = Array;

  assert.isFunction(addAll);
  assert.arity(addAll, 0);
  assert.name(addAll, 'addAll');
  assert.looksNative(addAll);
  assert.nonEnumerable(Set.prototype, 'addAll');

  const set = new Set([1]);
  assert.same(set.addAll(2), set);

  assert.deepEqual(from(new Set([1, 2, 3]).addAll(4, 5)), [1, 2, 3, 4, 5]);
  assert.deepEqual(from(new Set([1, 2, 3]).addAll(3, 4)), [1, 2, 3, 4]);
  assert.deepEqual(from(new Set([1, 2, 3]).addAll()), [1, 2, 3]);

  assert.notThrows(() => addAll.call({ add() { /* empty */ } }, 1, 2, 3));
  assert.throws(() => addAll.call({}, 1, 2, 3), TypeError);
  assert.throws(() => addAll.call(undefined, 1, 2, 3), TypeError);
  assert.throws(() => addAll.call(null, 1, 2, 3), TypeError);
});
