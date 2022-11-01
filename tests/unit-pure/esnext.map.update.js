import Map from 'core-js-pure/full/map';

QUnit.test('Map#update', assert => {
  const { update } = Map.prototype;
  assert.isFunction(update);
  assert.arity(update, 2);
  assert.name(update, 'update');
  assert.nonEnumerable(Map.prototype, 'update');

  let map = new Map([[9, 2]]);
  assert.same(map.update(9, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 2, 'correct value in callback');
    assert.same(key, 9, 'correct key in callback');
    assert.same(that, map, 'correct link to map in callback');
    return value * 2;
  }), map, 'returns this');
  assert.same(map.size, 1, 'correct size');
  assert.same(map.get(9), 4, 'correct result');
  map = new Map([[4, 5]]);
  map.update(9, function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 2, 'correct value in callback');
    assert.same(key, 9, 'correct key in callback');
    assert.same(that, map, 'correct link to map in callback');
    return value * 2;
  }, function (key, that) {
    assert.same(arguments.length, 2, 'correct number of thunk arguments');
    assert.same(key, 9, 'correct key in thunk');
    assert.same(that, map, 'correct link to map in thunk');
    return 2;
  });
  assert.same(map.size, 2, 'correct size');
  assert.same(map.get(4), 5, 'correct result #1');
  assert.same(map.get(9), 4, 'correct result #2');

  assert.throws(() => new Map([[9, 2]]).update(9), TypeError);
  assert.throws(() => new Map().update(9, () => { /* empty */ }), TypeError);

  assert.throws(() => update.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => update.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => update.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => update.call(null, () => { /* empty */ }), TypeError);
});
