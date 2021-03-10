import WeakMap from 'core-js-pure/full/weak-map';

QUnit.test('WeakMap#deleteAll', assert => {
  const { deleteAll } = WeakMap.prototype;

  assert.isFunction(deleteAll);
  assert.arity(deleteAll, 0);
  assert.nonEnumerable(WeakMap.prototype, 'deleteAll');

  const a = [];
  const b = [];
  const c = [];
  const d = [];
  const e = [];

  let set = new WeakMap([[a, 1], [b, 2], [c, 3]]);
  assert.same(set.deleteAll(a, b), true);
  assert.ok(!set.has(a));
  assert.ok(!set.has(b));
  assert.ok(set.has(c));
  assert.ok(!set.has(d));
  assert.ok(!set.has(e));

  set = new WeakMap([[a, 1], [b, 2], [c, 3]]);
  assert.same(set.deleteAll(c, d), false);
  assert.ok(set.has(a));
  assert.ok(set.has(b));
  assert.ok(!set.has(c));
  assert.ok(!set.has(d));
  assert.ok(!set.has(e));

  set = new WeakMap([[a, 1], [b, 2], [c, 3]]);
  assert.same(set.deleteAll(d, e), false);
  assert.ok(set.has(a));
  assert.ok(set.has(b));
  assert.ok(set.has(c));
  assert.ok(!set.has(d));
  assert.ok(!set.has(e));

  set = new WeakMap([[a, 1], [b, 2], [c, 3]]);
  assert.same(set.deleteAll(), true);
  assert.ok(set.has(a));
  assert.ok(set.has(b));
  assert.ok(set.has(c));
  assert.ok(!set.has(d));
  assert.ok(!set.has(e));

  assert.notThrows(() => !deleteAll.call({ delete() { /* empty */ } }, a, b, c));
  assert.throws(() => deleteAll.call({}, a, b, c), TypeError);
  assert.throws(() => deleteAll.call(undefined, a, b, c), TypeError);
  assert.throws(() => deleteAll.call(null, a, b, c), TypeError);
});
