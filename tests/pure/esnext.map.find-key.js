import Map from 'core-js-pure/full/map';

QUnit.test('Map#findKey', assert => {
  const { findKey } = Map.prototype;

  assert.isFunction(findKey);
  assert.arity(findKey, 1);
  assert.nonEnumerable(Map.prototype, 'findKey');

  const set = new Map([[1, 2]]);
  const context = {};
  set.findKey(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 2, 'correct value in callback');
    assert.same(key, 1, 'correct key in callback');
    assert.same(that, set, 'correct link to set in callback');
    assert.same(this, context, 'correct callback context');
  }, context);

  assert.same(new Map([[1, 2], [2, 3], [3, 4]]).findKey(it => it % 2), 2);
  assert.same(new Map().findKey(it => it === 42), undefined);

  assert.throws(() => findKey.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => findKey.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => findKey.call(null, () => { /* empty */ }), TypeError);
});
