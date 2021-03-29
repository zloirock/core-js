import Map from 'core-js-pure/full/map';
import from from 'core-js-pure/full/array/from';

QUnit.test('Map#mapKeys', assert => {
  const { mapKeys } = Map.prototype;

  assert.isFunction(mapKeys);
  assert.arity(mapKeys, 1);
  assert.name(mapKeys, 'mapKeys');
  assert.nonEnumerable(Map.prototype, 'mapKeys');

  const map = new Map([[1, 2]]);
  const context = {};
  map.mapKeys(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 2, 'correct value in callback');
    assert.same(key, 1, 'correct key in callback');
    assert.same(that, map, 'correct link to map in callback');
    assert.same(this, context, 'correct callback context');
  }, context);

  assert.ok(new Map().mapKeys(it => it) instanceof Map);

  assert.deepEqual(from(new Map([
    ['a', 1],
    [1, 2],
    ['b', 3],
    [2, 'q'],
    ['c', {}],
    [3, 4],
    ['d', true],
    [4, 5],
  ]).mapKeys((value, key) => `${ key }${ value }`)), [
    ['a1', 1],
    ['12', 2],
    ['b3', 3],
    ['2q', 'q'],
    ['c[object Object]', {}],
    ['34', 4],
    ['dtrue', true],
    ['45', 5],
  ]);

  assert.throws(() => mapKeys.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => mapKeys.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => mapKeys.call(null, () => { /* empty */ }), TypeError);
});
