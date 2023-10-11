import WeakSet from '@core-js/pure/full/weak-set';

QUnit.test('WeakSet#deleteAll', assert => {
  const { deleteAll } = WeakSet.prototype;

  assert.isFunction(deleteAll);
  assert.arity(deleteAll, 0);
  assert.name(deleteAll, 'deleteAll');
  assert.nonEnumerable(WeakSet.prototype, 'deleteAll');

  const a = [];
  const b = [];
  const c = [];
  const d = [];
  const e = [];

  let set = new WeakSet([a, b, c]);
  assert.true(set.deleteAll(a, b));
  assert.false(set.has(a));
  assert.false(set.has(b));
  assert.true(set.has(c));
  assert.false(set.has(d));
  assert.false(set.has(e));

  set = new WeakSet([a, b, c]);
  assert.false(set.deleteAll(c, d));
  assert.true(set.has(a));
  assert.true(set.has(b));
  assert.false(set.has(c));
  assert.false(set.has(d));
  assert.false(set.has(e));

  set = new WeakSet([a, b, c]);
  assert.false(set.deleteAll(d, e));
  assert.true(set.has(a));
  assert.true(set.has(b));
  assert.true(set.has(c));
  assert.false(set.has(d));
  assert.false(set.has(e));

  set = new WeakSet([a, b, c]);
  assert.true(set.deleteAll());
  assert.true(set.has(a));
  assert.true(set.has(b));
  assert.true(set.has(c));
  assert.false(set.has(d));
  assert.false(set.has(e));

  assert.throws(() => deleteAll.call({ delete() { /* empty */ } }, a, b, c));
  assert.throws(() => deleteAll.call({}, a, b, c), TypeError);
  assert.throws(() => deleteAll.call(undefined, a, b, c), TypeError);
  assert.throws(() => deleteAll.call(null, a, b, c), TypeError);
});
