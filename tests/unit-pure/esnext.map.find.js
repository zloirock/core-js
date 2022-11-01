import Map from 'core-js-pure/full/map';

QUnit.test('Map#find', assert => {
  const { find } = Map.prototype;

  assert.isFunction(find);
  assert.arity(find, 1);
  assert.nonEnumerable(Map.prototype, 'find');

  const set = new Map([[1, 2]]);
  const context = {};
  set.find(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 2, 'correct value in callback');
    assert.same(key, 1, 'correct key in callback');
    assert.same(that, set, 'correct link to set in callback');
    assert.same(this, context, 'correct callback context');
  }, context);

  assert.same(new Map([[1, 2], [2, 3], [3, 4]]).find(it => it % 2), 3);
  assert.same(new Map().find(it => it === 42), undefined);

  assert.throws(() => find.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => find.call(null, () => { /* empty */ }), TypeError);
});
