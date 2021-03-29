import { createIterable } from '../helpers/helpers';

import Set from 'core-js-pure/full/set';

QUnit.test('Set#isSupersetOf', assert => {
  const { isSupersetOf } = Set.prototype;

  assert.isFunction(isSupersetOf);
  assert.arity(isSupersetOf, 1);
  assert.name(isSupersetOf, 'isSupersetOf');
  assert.nonEnumerable(Set.prototype, 'isSupersetOf');

  assert.ok(new Set([1, 2, 3]).isSupersetOf([1]));
  assert.ok(!new Set([2, 3, 4]).isSupersetOf([1]));
  assert.ok(new Set([5, 4, 3, 2, 1]).isSupersetOf([1, 2, 3]));
  assert.ok(!new Set([5, 4, 3, 2]).isSupersetOf([1, 2, 3]));

  assert.ok(new Set([1, 2, 3]).isSupersetOf(createIterable([1])));
  assert.ok(!new Set([2, 3, 4]).isSupersetOf(createIterable([1])));

  assert.throws(() => new Set([1, 2, 3]).isSupersetOf(), TypeError);
  assert.throws(() => isSupersetOf.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => isSupersetOf.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => isSupersetOf.call(null, [1, 2, 3]), TypeError);
});
