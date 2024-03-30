import { createIterable, createSetLike } from '../helpers/helpers.js';

// TODO: use /es/ in core-js@4
import Set from 'core-js-pure/full/set';

QUnit.test('Set#isSubsetOf', assert => {
  const { isSubsetOf } = Set.prototype;

  assert.isFunction(isSubsetOf);
  assert.arity(isSubsetOf, 1);
  assert.name(isSubsetOf, 'isSubsetOf');
  assert.nonEnumerable(Set.prototype, 'isSubsetOf');

  assert.true(new Set([1]).isSubsetOf(new Set([1, 2, 3])));
  assert.false(new Set([1]).isSubsetOf(new Set([2, 3, 4])));
  assert.true(new Set([1, 2, 3]).isSubsetOf(new Set([5, 4, 3, 2, 1])));
  assert.false(new Set([1, 2, 3]).isSubsetOf(new Set([5, 4, 3, 2])));
  assert.true(new Set([1]).isSubsetOf(createSetLike([1, 2, 3])));
  assert.false(new Set([1]).isSubsetOf(createSetLike([2, 3, 4])));
  assert.true(new Set([1, 2, 3]).isSubsetOf(createSetLike([5, 4, 3, 2, 1])));
  assert.false(new Set([1, 2, 3]).isSubsetOf(createSetLike([5, 4, 3, 2])));

  // TODO: drop from core-js@4
  assert.true(new Set([1]).isSubsetOf([1, 2, 3]));
  assert.false(new Set([1]).isSubsetOf([2, 3, 4]));
  assert.true(new Set([1, 2, 3]).isSubsetOf([5, 4, 3, 2, 1]));
  assert.false(new Set([1, 2, 3]).isSubsetOf([5, 4, 3, 2]));
  assert.true(new Set([1]).isSubsetOf(createIterable([1, 2, 3])));
  assert.false(new Set([1]).isSubsetOf(createIterable([2, 3, 4])));

  assert.throws(() => new Set([1, 2, 3]).isSubsetOf(), TypeError);
  assert.throws(() => isSubsetOf.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => isSubsetOf.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => isSubsetOf.call(null, [1, 2, 3]), TypeError);
});
