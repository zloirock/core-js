import { createIterator } from '../helpers/helpers';

QUnit.test('Iterator#map', assert => {
  const { map } = Iterator.prototype;

  assert.isFunction(map);
  assert.arity(map, 1);
  assert.name(map, 'map');
  assert.looksNative(map);
  assert.nonEnumerable(Iterator.prototype, 'map');

  assert.arrayEqual(map.call(createIterator([1, 2, 3]), it => it ** 2).toArray(), [1, 4, 9], 'basic functionality');

  assert.throws(() => map.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => map.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => map.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => map.call([], () => { /* empty */ }), TypeError);
});
