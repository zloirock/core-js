import WeakMap from 'core-js-pure/features/weak-map';

QUnit.test('WeakMap#upsert', assert => {
  const { upsert } = WeakMap.prototype;
  assert.isFunction(upsert);
  assert.arity(upsert, 3);
  assert.nonEnumerable(WeakMap.prototype, 'upsert');

  const a = {};
  const b = {};

  const map = new WeakMap([[a, 2]]);
  assert.same(map.upsert(a, function (value) {
    assert.same(arguments.length, 1, 'correct number of callback arguments');
    assert.same(value, 2, 'correct value in callback');
    return value ** 2;
  }, () => {
    assert.ok(false, 'should not be called');
    return 3;
  }), 4, 'returns a correct value');
  assert.same(map.upsert(b, value => {
    assert.ok(false, 'should not be called');
    return value ** 2;
  }, function () {
    assert.same(arguments.length, 0, 'correct number of callback arguments');
    return 3;
  }), 3, 'returns a correct value');
  assert.same(map.get(a), 4, 'correct result #1');
  assert.same(map.get(b), 3, 'correct result #2');

  assert.same(new WeakMap([[a, 2]]).upsert(b, null, () => 3), 3);
  assert.same(new WeakMap([[a, 2]]).upsert(a, value => value ** 2), 4);

  assert.throws(() => new WeakMap().upsert(a), TypeError);
  assert.throws(() => upsert.call({}, a, () => { /* empty */ }, () => { /* empty */ }), TypeError);
  assert.throws(() => upsert.call([], a, () => { /* empty */ }, () => { /* empty */ }), TypeError);
  assert.throws(() => upsert.call(undefined, a, () => { /* empty */ }, () => { /* empty */ }), TypeError);
  assert.throws(() => upsert.call(null, a, () => { /* empty */ }, () => { /* empty */ }), TypeError);
});
