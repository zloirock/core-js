QUnit.test('Map#filter', assert => {
  const { filter } = Map.prototype;
  const { from } = Array;

  assert.isFunction(filter);
  assert.arity(filter, 1);
  assert.name(filter, 'filter');
  assert.looksNative(filter);
  assert.nonEnumerable(Map.prototype, 'filter');

  const map = new Map([[1, 2]]);
  const context = {};
  map.filter(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 2, 'correct value in callback');
    assert.same(key, 1, 'correct key in callback');
    assert.same(that, map, 'correct link to map in callback');
    assert.same(this, context, 'correct callback context');
  }, context);

  assert.ok(new Map().filter(it => it) instanceof Map);

  assert.deepEqual(from(new Map([
    ['a', 1],
    [1, 2],
    ['b', 3],
    [2, 'q'],
    ['c', {}],
    [3, 4],
    ['d', true],
    [4, 5],
  ]).filter(it => typeof it === 'number')), [
    ['a', 1],
    [1, 2],
    ['b', 3],
    [3, 4],
    [4, 5],
  ]);

  assert.throws(() => filter.call(new Set(), () => { /* empty */ }), TypeError);
  assert.throws(() => filter.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => filter.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => filter.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => filter.call(null, () => { /* empty */ }), TypeError);
});
