import Map from 'core-js-pure/full/map';

QUnit.test('Map#upsert', assert => {
  const { upsert } = Map.prototype;
  assert.isFunction(upsert);
  assert.arity(upsert, 2);
  assert.nonEnumerable(Map.prototype, 'upsert');

  const map = new Map([['a', 2]]);
  assert.same(map.upsert('a', function (value) {
    assert.same(arguments.length, 1, 'correct number of callback arguments');
    assert.same(value, 2, 'correct value in callback');
    return value ** 2;
  }, () => {
    assert.avoid();
    return 3;
  }), 4, 'returns a correct value');
  assert.same(map.upsert('b', value => {
    assert.avoid();
    return value ** 2;
  }, function () {
    assert.same(arguments.length, 0, 'correct number of callback arguments');
    return 3;
  }), 3, 'returns a correct value');
  assert.same(map.size, 2, 'correct size');
  assert.same(map.get('a'), 4, 'correct result #1');
  assert.same(map.get('b'), 3, 'correct result #2');

  assert.same(new Map([['a', 2]]).upsert('b', null, () => 3), 3);
  assert.same(new Map([['a', 2]]).upsert('a', value => value ** 2), 4);

  assert.throws(() => new Map().upsert('a'), TypeError);
  assert.throws(() => upsert.call({}, 'a', () => { /* empty */ }, () => { /* empty */ }), TypeError);
  assert.throws(() => upsert.call([], 'a', () => { /* empty */ }, () => { /* empty */ }), TypeError);
  assert.throws(() => upsert.call(undefined, 'a', () => { /* empty */ }, () => { /* empty */ }), TypeError);
  assert.throws(() => upsert.call(null, 'a', () => { /* empty */ }, () => { /* empty */ }), TypeError);
});
