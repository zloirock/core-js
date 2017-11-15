import { NATIVE, STRICT } from '../helpers/constants';

QUnit.test('Array#map', assert => {
  const { map } = Array.prototype;
  assert.isFunction(map);
  assert.arity(map, 1);
  assert.name(map, 'map');
  assert.looksNative(map);
  assert.nonEnumerable(Array.prototype, 'map');
  const array = [1];
  const context = {};
  array.map(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 0, 'correct index in callback');
    assert.same(that, array, 'correct link to array in callback');
    assert.same(this, context, 'correct callback context');
  }, context);
  assert.deepEqual([2, 3, 4], [1, 2, 3].map(value => value + 1));
  assert.deepEqual([1, 3, 5], [1, 2, 3].map((value, key) => value + key));
  assert.deepEqual([2, 2, 2], [1, 2, 3].map(function () {
    return +this;
  }, 2));
  if (STRICT) {
    assert.throws(() => {
      return map.call(null, () => { /* empty */ });
    }, TypeError);
    assert.throws(() => {
      return map.call(undefined, () => { /* empty */ });
    }, TypeError);
  }
  if (NATIVE) {
    assert.ok((() => {
      try {
        return map.call({
          length: -1,
          0: 1
        }, () => {
          throw new Error();
        });
      } catch (e) { /* empty */ }
    })(), 'uses ToLength');
  }
});
