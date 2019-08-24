import AsyncIterator from 'core-js-pure/features/async-iterator';

import { createIterator } from '../helpers/helpers';

QUnit.test('AsyncIterator#map', assert => {
  assert.expect(8);
  const async = assert.async();
  const { map } = AsyncIterator.prototype;

  assert.isFunction(map);
  assert.arity(map, 1);
  assert.nonEnumerable(AsyncIterator.prototype, 'map');

  map.call(createIterator([1, 2, 3]), it => it ** 2).toArray().then(it => {
    assert.arrayEqual(it, [1, 4, 9], 'basic functionality');
    async();
  });

  assert.throws(() => map.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => map.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => map.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => map.call([], () => { /* empty */ }), TypeError);
});
