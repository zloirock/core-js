import { createIterable } from '../helpers/helpers';

import Set from 'core-js-pure/full/set';

QUnit.test('Set#isSubsetOf', assert => {
  const { isSubsetOf } = Set.prototype;

  assert.isFunction(isSubsetOf);
  assert.arity(isSubsetOf, 1);
  assert.name(isSubsetOf, 'isSubsetOf');
  assert.nonEnumerable(Set.prototype, 'isSubsetOf');

  assert.ok(new Set([1]).isSubsetOf([1, 2, 3]));
  assert.ok(!new Set([1]).isSubsetOf([2, 3, 4]));
  assert.ok(new Set([1, 2, 3]).isSubsetOf([5, 4, 3, 2, 1]));
  assert.ok(!new Set([1, 2, 3]).isSubsetOf([5, 4, 3, 2]));

  assert.ok(new Set([1]).isSubsetOf(createIterable([1, 2, 3])));
  assert.ok(!new Set([1]).isSubsetOf(createIterable([2, 3, 4])));

  assert.ok(new Set([1]).isSubsetOf({ has: () => true }));
  assert.ok(!new Set([1]).isSubsetOf({ has: () => false }));

  assert.ok(isSubsetOf.call('ab', ['a', 'b', 'c']));
  assert.ok(!isSubsetOf.call('ab', ['a']));

  assert.throws(() => new Set([1, 2, 3]).isSubsetOf(), TypeError);
  assert.throws(() => isSubsetOf.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => isSubsetOf.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => isSubsetOf.call(null, [1, 2, 3]), TypeError);
});
