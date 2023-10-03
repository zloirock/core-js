import { createSetLike } from '../helpers/helpers.js';

QUnit.test('Set#isSupersetOf', assert => {
  const { isSupersetOf } = Set.prototype;

  assert.isFunction(isSupersetOf);
  assert.arity(isSupersetOf, 1);
  assert.name(isSupersetOf, 'isSupersetOf');
  assert.looksNative(isSupersetOf);
  assert.nonEnumerable(Set.prototype, 'isSupersetOf');

  assert.true(new Set([1, 2, 3]).isSupersetOf(new Set([1])));
  assert.false(new Set([2, 3, 4]).isSupersetOf(new Set([1])));
  assert.true(new Set([5, 4, 3, 2, 1]).isSupersetOf(new Set([1, 2, 3])));
  assert.false(new Set([5, 4, 3, 2]).isSupersetOf(new Set([1, 2, 3])));
  assert.true(new Set([1, 2, 3]).isSupersetOf(createSetLike([1])));
  assert.false(new Set([2, 3, 4]).isSupersetOf(createSetLike([1])));
  assert.true(new Set([5, 4, 3, 2, 1]).isSupersetOf(createSetLike([1, 2, 3])));
  assert.false(new Set([5, 4, 3, 2]).isSupersetOf(createSetLike([1, 2, 3])));

  assert.false(new Set([42, 43]).isSupersetOf({
    size: Infinity,
    has() {
      return true;
    },
    keys() {
      throw new Error('Unexpected call to |keys| method');
    },
  }));

  assert.throws(() => new Set().isSupersetOf({
    size: -Infinity,
    has() {
      return true;
    },
    keys() {
      throw new Error('Unexpected call to |keys| method');
    },
  }));

  let closed = false;
  assert.false(new Set([1, 2, 3, 4]).isSupersetOf({
    size: 3,
    has() { return true; },
    keys() {
      let index = 0;
      return {
        next() {
          return { value: [1, 5, 3][index++], done: index > 3 };
        },
        return() {
          closed = true;
          return { done: true };
        },
      };
    },
  }));
  assert.true(closed, 'iterator is closed on early exit');

  assert.throws(() => new Set([1, 2, 3]).isSupersetOf(), TypeError);
  assert.throws(() => isSupersetOf.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => isSupersetOf.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => isSupersetOf.call(null, [1, 2, 3]), TypeError);
});
