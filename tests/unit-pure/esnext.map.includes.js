import Map from '@core-js/pure/full/map';

QUnit.test('Map#includes', assert => {
  const { includes } = Map.prototype;
  assert.isFunction(includes);
  assert.name(includes, 'includes');
  assert.arity(includes, 1);
  assert.nonEnumerable(Map.prototype, 'includes');

  const object = {};
  const map = new Map([[1, 1], [2, 2], [3, 3], [4, -0], [5, object], [6, NaN]]);
  assert.true(map.includes(1));
  assert.true(map.includes(-0));
  assert.true(map.includes(0));
  assert.true(map.includes(object));
  assert.false(map.includes(4));
  assert.false(map.includes(-0.5));
  assert.false(map.includes({}));
  assert.true(map.includes(NaN));

  assert.throws(() => includes.call({}, 1), TypeError);
  assert.throws(() => includes.call(undefined, 1), TypeError);
  assert.throws(() => includes.call(null, 1), TypeError);
});
