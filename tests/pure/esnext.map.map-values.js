import { Map, Set } from 'core-js-pure';
import from from 'core-js-pure/features/array/from';

QUnit.test('Map#mapValues', assert => {
  const { mapValues } = Map.prototype;

  assert.isFunction(mapValues);
  assert.arity(mapValues, 1);
  if ('name' in mapValues) assert.name(mapValues, 'mapValues');
  assert.nonEnumerable(Map.prototype, 'mapValues');

  const map = new Map([[1, 2]]);
  const context = {};
  map.mapValues(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 2, 'correct value in callback');
    assert.same(key, 1, 'correct key in callback');
    assert.same(that, map, 'correct link to map in callback');
    assert.same(this, context, 'correct callback context');
  }, context);

  assert.ok(new Map().mapValues(it => it) instanceof Map);

  assert.deepEqual(from(new Map([
    ['a', 1],
    [1, 2],
    ['b', 3],
    [2, 'q'],
    ['c', {}],
    [3, 4],
    ['d', true],
    [4, 5],
  ]).mapValues((value, key) => `${ key }${ value }`)), [
    ['a', 'a1'],
    [1, '12'],
    ['b', 'b3'],
    [2, '2q'],
    ['c', 'c[object Object]'],
    [3, '34'],
    ['d', 'dtrue'],
    [4, '45'],
  ]);

  assert.throws(() => mapValues.call(new Set(), () => { /* empty */ }), TypeError);
  assert.throws(() => mapValues.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => mapValues.call([], () => { /* empty */ }), TypeError);
  assert.throws(() => mapValues.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => mapValues.call(null, () => { /* empty */ }), TypeError);
});
