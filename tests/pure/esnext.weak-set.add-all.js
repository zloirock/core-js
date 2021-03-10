import WeakSet from 'core-js-pure/full/weak-set';

QUnit.test('WeakSet#addAll', assert => {
  const { addAll } = WeakSet.prototype;

  assert.isFunction(addAll);
  assert.arity(addAll, 0);
  assert.name(addAll, 'addAll');
  assert.nonEnumerable(WeakSet.prototype, 'addAll');

  const a = [];
  const b = [];
  const c = [];

  let set = new WeakSet([a]);
  assert.same(set.addAll(b), set);

  set = new WeakSet([a]).addAll(b, c);
  assert.ok(set.has(a));
  assert.ok(set.has(b));
  assert.ok(set.has(c));

  set = new WeakSet([a]).addAll(a, b);
  assert.ok(set.has(a));
  assert.ok(set.has(b));

  set = new WeakSet([a]).addAll();
  assert.ok(set.has(a));

  assert.notThrows(() => addAll.call({ add() { /* empty */ } }, a, b, c));
  assert.throws(() => addAll.call({}, a, b, c), TypeError);
  assert.throws(() => addAll.call(undefined, a, b, c), TypeError);
  assert.throws(() => addAll.call(null, a, b, c), TypeError);
});
