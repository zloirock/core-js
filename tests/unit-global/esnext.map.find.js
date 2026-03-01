QUnit.test('Map#find', assert => {
  const { find } = Map.prototype;

  assert.isFunction(find);
  assert.arity(find, 1);
  assert.name(find, 'find');
  assert.looksNative(find);
  assert.nonEnumerable(Map.prototype, 'find');

  const map = new Map([[1, 2]]);
  const context = {};
  map.find(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 2, 'correct value in callback');
    assert.same(key, 1, 'correct key in callback');
    assert.same(that, map, 'correct link to map in callback');
    assert.same(this, context, 'correct callback context');
  }, context);

  assert.same(new Map([[1, 2], [2, 3], [3, 4]]).find(it => it % 2), 3);
  assert.same(new Map().find(it => it === 42), undefined);

  assert.throws(() => find.call(new Set(), () => { /* empty */ }), TypeError);
  assert.throws(() => find.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => find.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call(null, () => { /* empty */ }), TypeError);
});
