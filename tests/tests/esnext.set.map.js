import { STRICT } from '../helpers/constants';

QUnit.test('Set#map', assert => {
  const { map } = Set.prototype;
  const { from } = Array;

  assert.isFunction(map);
  assert.arity(map, 1);
  assert.name(map, 'map');
  assert.looksNative(map);
  assert.nonEnumerable(Set.prototype, 'map');

  const set = new Set([1]);
  const context = {};
  set.map(function (value, key, that) {
    assert.same(arguments.length, 3, 'correct number of callback arguments');
    assert.same(value, 1, 'correct value in callback');
    assert.same(key, 1, 'correct key in callback');
    assert.same(that, set, 'correct link to set in callback');
    assert.same(this, context, 'correct callback context');
  }, context);

  assert.deepEqual(from(new Set([1, 2, 3]).map(it => it ** 2)), [1, 4, 9]);
  assert.deepEqual(from(new Set([1, 2, 3]).map(it => it % 2)), [1, 0]);

  assert.throws(() => map.call({}, () => { /* empty */ }), TypeError);

  if (STRICT) {
    assert.throws(() => map.call(undefined, () => { /* empty */ }), TypeError);
    assert.throws(() => map.call(undefined, () => { /* empty */ }), TypeError);
  }
});
