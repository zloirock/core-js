import { createIterable, createSetLike } from '../helpers/helpers.js';

QUnit.test('Set#symmetricDifference', assert => {
  const { symmetricDifference } = Set.prototype;
  const { from } = Array;

  assert.isFunction(symmetricDifference);
  assert.arity(symmetricDifference, 1);
  assert.name(symmetricDifference, 'symmetricDifference');
  assert.looksNative(symmetricDifference);
  assert.nonEnumerable(Set.prototype, 'symmetricDifference');

  const set = new Set([1]);
  assert.notSame(set.symmetricDifference(new Set()), set);

  assert.deepEqual(from(new Set([1, 2, 3]).symmetricDifference(new Set([4, 5]))), [1, 2, 3, 4, 5]);
  assert.deepEqual(from(new Set([1, 2, 3]).symmetricDifference(new Set([3, 4]))), [1, 2, 4]);
  assert.deepEqual(from(new Set([1, 2, 3]).symmetricDifference(createSetLike([4, 5]))), [1, 2, 3, 4, 5]);
  assert.deepEqual(from(new Set([1, 2, 3]).symmetricDifference(createSetLike([3, 4]))), [1, 2, 4]);

  // TODO: drop from core-js@4
  assert.deepEqual(from(new Set([1, 2, 3]).symmetricDifference([4, 5])), [1, 2, 3, 4, 5]);
  assert.deepEqual(from(new Set([1, 2, 3]).symmetricDifference([3, 4])), [1, 2, 4]);
  assert.deepEqual(from(new Set([1, 2, 3]).symmetricDifference(createIterable([4, 5]))), [1, 2, 3, 4, 5]);
  assert.deepEqual(from(new Set([1, 2, 3]).symmetricDifference(createIterable([3, 4]))), [1, 2, 4]);

  assert.throws(() => new Set([1, 2, 3]).symmetricDifference(), TypeError);

  assert.throws(() => symmetricDifference.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => symmetricDifference.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => symmetricDifference.call(null, [1, 2, 3]), TypeError);

  {
    // https://github.com/WebKit/WebKit/pull/27264/files#diff-7bdbbad7ceaa222787994f2db702dd45403fa98e14d6270aa65aaf09754dcfe0R8
    const baseSet = new Set(['a', 'b', 'c', 'd', 'e']);
    const values = ['f', 'g', 'h', 'i', 'j'];
    const setLike = {
      size: values.length,
      has() { return true; },
      keys() {
        let index = 0;
        return {
          next() {
            const done = index >= values.length;
            if (!baseSet.has('f')) baseSet.add('f');
            return { done, value: values[index++] };
          },
        };
      },
    };
    assert.deepEqual(from(baseSet.symmetricDifference(setLike)), ['a', 'b', 'c', 'd', 'e', 'g', 'h', 'i', 'j']);
  }

  {
    // Should get next before cloning this
    // https://bugs.webkit.org/show_bug.cgi?id=289430
    const baseSet = new Set([1, 2, 3]);
    const setLike = {
      size: 0,
      has() { return true; },
      keys() {
        return {
          // eslint-disable-next-line es/no-accessor-properties -- needed for test
          get next() {
            baseSet.clear();
            baseSet.add(4);
            return function () {
              return { done: true };
            };
          },
        };
      },
    };
    assert.deepEqual(from(baseSet.symmetricDifference(setLike)), [4]);
  }
});
