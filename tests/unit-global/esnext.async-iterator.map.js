import { createIterator } from '../helpers/helpers.js';
import { STRICT, STRICT_THIS } from '../helpers/constants.js';

QUnit.test('AsyncIterator#map', assert => {
  const { map } = AsyncIterator.prototype;

  assert.isFunction(map);
  assert.arity(map, 1);
  assert.name(map, 'map');
  assert.looksNative(map);
  assert.nonEnumerable(AsyncIterator.prototype, 'map');

  if (STRICT) {
    assert.throws(() => map.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => map.call(null, () => { /* empty */ }), TypeError);
  }

  assert.throws(() => map.call(createIterator([1]), undefined), TypeError);
  assert.throws(() => map.call(createIterator([1]), null), TypeError);
  assert.throws(() => map.call(createIterator([1]), {}), TypeError);

  return map.call(createIterator([1, 2, 3]), it => it ** 2).toArray().then(it => {
    assert.arrayEqual(it, [1, 4, 9], 'basic functionality');
    const counters = [];
    return map.call(createIterator([1, 2, 3]), (value, counter) => { counters.push(counter); return value; }).toArray().then(() => {
      assert.arrayEqual(counters, [0, 1, 2], 'counter incremented');
    });
  }).then(() => {
    return map.call(createIterator([1]), function (arg, counter) {
      assert.same(this, STRICT_THIS, 'this');
      assert.same(arguments.length, 2, 'arguments length');
      assert.same(arg, 1, 'argument');
      assert.same(counter, 0, 'counter');
    }).toArray();
  }).then(() => {
    return map.call(createIterator([1]), () => { throw 42; }).toArray();
  }).then(() => {
    assert.avoid();
  }, error => {
    assert.same(error, 42, 'rejection on a callback error');
  });
});
