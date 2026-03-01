QUnit.test('WeakMap#deleteAll', assert => {
  const { deleteAll } = WeakMap.prototype;

  assert.isFunction(deleteAll);
  assert.arity(deleteAll, 0);
  assert.name(deleteAll, 'deleteAll');
  assert.looksNative(deleteAll);
  assert.nonEnumerable(WeakMap.prototype, 'deleteAll');

  const a = [];
  const b = [];
  const c = [];
  const d = [];
  const e = [];

  let map = new WeakMap([[a, 1], [b, 2], [c, 3]]);
  assert.true(map.deleteAll(a, b));
  assert.false(map.has(a));
  assert.false(map.has(b));
  assert.true(map.has(c));
  assert.false(map.has(d));
  assert.false(map.has(e));

  map = new WeakMap([[a, 1], [b, 2], [c, 3]]);
  assert.false(map.deleteAll(c, d));
  assert.true(map.has(a));
  assert.true(map.has(b));
  assert.false(map.has(c));
  assert.false(map.has(d));
  assert.false(map.has(e));

  map = new WeakMap([[a, 1], [b, 2], [c, 3]]);
  assert.false(map.deleteAll(d, e));
  assert.true(map.has(a));
  assert.true(map.has(b));
  assert.true(map.has(c));
  assert.false(map.has(d));
  assert.false(map.has(e));

  map = new WeakMap([[a, 1], [b, 2], [c, 3]]);
  assert.true(map.deleteAll());
  assert.true(map.has(a));
  assert.true(map.has(b));
  assert.true(map.has(c));
  assert.false(map.has(d));
  assert.false(map.has(e));

  assert.throws(() => deleteAll.call({ delete() { /* empty */ } }, a, b, c));
  assert.throws(() => deleteAll.call({}, a, b, c), TypeError);
  assert.throws(() => deleteAll.call(undefined, a, b, c), TypeError);
  assert.throws(() => deleteAll.call(null, a, b, c), TypeError);
});
