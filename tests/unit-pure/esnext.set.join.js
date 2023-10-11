/* eslint-disable unicorn/require-array-join-separator -- required for testing */
import Set from '@core-js/pure/full/set';

QUnit.test('Set#join', assert => {
  const { join } = Set.prototype;

  assert.isFunction(join);
  assert.arity(join, 1);
  assert.name(join, 'join');
  assert.nonEnumerable(Set.prototype, 'join');

  assert.same(new Set([1, 2, 3]).join(), '1,2,3');
  assert.same(new Set([1, 2, 3]).join(undefined), '1,2,3');
  assert.same(new Set([1, 2, 3]).join('|'), '1|2|3');

  assert.throws(() => join.call({}), TypeError);
  assert.throws(() => join.call(undefined), TypeError);
  assert.throws(() => join.call(null), TypeError);
});
