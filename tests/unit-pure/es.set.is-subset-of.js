import { createSetLike } from '../helpers/helpers.js';

import Set from 'core-js-pure/es/set';

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

  assert.true(new Set([42, 43]).isSubsetOf({
    size: Infinity,
    has() {
      return true;
    },
    keys() {
      throw new Error('Unexpected call to |keys| method');
    },
  }));

  assert.throws(() => new Set().isSubsetOf({
    size: -Infinity,
    has() {
      return true;
    },
    keys() {
      throw new Error('Unexpected call to |keys| method');
    },
  }));

  assert.throws(() => new Set([1, 2, 3]).isSubsetOf(), TypeError);
  assert.throws(() => isSubsetOf.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => isSubsetOf.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => isSubsetOf.call(null, [1, 2, 3]), TypeError);
});
