import { createIterator } from '../helpers/helpers';
import { STRICT_THIS } from '../helpers/constants';

QUnit.test('AsyncIterator#map', assert => {
  assert.expect(13);
  const async = assert.async();
  const { map } = AsyncIterator.prototype;

  assert.isFunction(map);
  assert.arity(map, 1);
  assert.name(map, 'map');
  assert.looksNative(map);
  assert.nonEnumerable(AsyncIterator.prototype, 'map');

  map.call(createIterator([1, 2, 3]), it => it ** 2).toArray().then(it => {
    assert.arrayEqual(it, [1, 4, 9], 'basic functionality');
    return map.call(createIterator([1]), function (arg) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 1, 'arguments length');
      assert.same(arg, 1, 'argument');
    }).toArray();
  }).then(() => async());

  assert.throws(() => map.call(undefined, () => { /* empty */ }), TypeError);
  assert.throws(() => map.call(null, () => { /* empty */ }), TypeError);
  assert.throws(() => map.call({}, () => { /* empty */ }), TypeError);
  assert.throws(() => map.call([], () => { /* empty */ }), TypeError);
});
