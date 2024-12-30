import { createIterable, createSetLike } from '../helpers/helpers.js';

QUnit.test('Set#difference', assert => {
  const { difference } = Set.prototype;
  const { from } = Array;

  assert.isFunction(difference);
  assert.arity(difference, 1);
  assert.name(difference, 'difference');
  assert.looksNative(difference);
  assert.nonEnumerable(Set.prototype, 'difference');

  const set = new Set([1]);
  assert.notSame(set.difference(new Set()), set);

  assert.deepEqual(from(new Set([1, 2, 3]).difference(new Set([4, 5]))), [1, 2, 3]);
  assert.deepEqual(from(new Set([1, 2, 3]).difference(new Set([3, 4]))), [1, 2]);
  assert.deepEqual(from(new Set([1, 2, 3]).difference(createSetLike([4, 5]))), [1, 2, 3]);
  assert.deepEqual(from(new Set([1, 2, 3]).difference(createSetLike([3, 4]))), [1, 2]);

  // TODO: drop from core-js@4
  assert.deepEqual(from(new Set([1, 2, 3]).difference([4, 5])), [1, 2, 3]);
  assert.deepEqual(from(new Set([1, 2, 3]).difference([3, 4])), [1, 2]);
  assert.deepEqual(from(new Set([1, 2, 3]).difference(createIterable([3, 4]))), [1, 2]);

  assert.same(new Set([42, 43]).difference({
    size: Infinity,
    has() {
      return true;
    },
    keys() {
      throw new Error('Unexpected call to |keys| method');
    },
  }).size, 0);

  assert.throws(() => new Set().difference({
    size: -Infinity,
    has() {
      return true;
    },
    keys() {
      throw new Error('Unexpected call to |keys| method');
    },
  }));

  assert.throws(() => new Set([1, 2, 3]).difference(), TypeError);

  assert.throws(() => difference.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => difference.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => difference.call(null, [1, 2, 3]), TypeError);
});
