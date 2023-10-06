import { createSetLike } from '../helpers/helpers.js';

QUnit.test('Set#union', assert => {
  const { union } = Set.prototype;
  const { from } = Array;
  const { defineProperty } = Object;

  assert.isFunction(union);
  assert.arity(union, 1);
  assert.name(union, 'union');
  assert.looksNative(union);
  assert.nonEnumerable(Set.prototype, 'union');

  const set = new Set([1]);
  assert.notSame(set.union(new Set()), set);

  assert.deepEqual(from(new Set([1, 2, 3]).union(new Set([4, 5]))), [1, 2, 3, 4, 5]);
  assert.deepEqual(from(new Set([1, 2, 3]).union(new Set([3, 4]))), [1, 2, 3, 4]);
  assert.deepEqual(from(new Set([1, 2, 3]).union(createSetLike([4, 5]))), [1, 2, 3, 4, 5]);
  assert.deepEqual(from(new Set([1, 2, 3]).union(createSetLike([3, 4]))), [1, 2, 3, 4]);

  assert.throws(() => new Set([1, 2, 3]).union(), TypeError);

  assert.throws(() => union.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => union.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => union.call(null, [1, 2, 3]), TypeError);

  {
    // Should get iterator record of a set-like object before cloning this
    // https://bugs.webkit.org/show_bug.cgi?id=289430
    const baseSet = new Set();
    const setLike = {
      size: 0,
      has() { return true; },
      keys() {
        return defineProperty({}, 'next', { get() {
          baseSet.clear();
          baseSet.add(4);
          return function () {
            return { done: true };
          };
        } });
      },
    };
    assert.deepEqual(from(baseSet.union(setLike)), [4]);
  }
});
