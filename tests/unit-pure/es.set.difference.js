import { createSetLike } from '../helpers/helpers.js';

import from from '@core-js/pure/es/array/from';
import Set from '@core-js/pure/es/set';

QUnit.test('Set#difference', assert => {
  const { difference } = Set.prototype;

  assert.isFunction(difference);
  assert.arity(difference, 1);
  assert.name(difference, 'difference');
  assert.nonEnumerable(Set.prototype, 'difference');

  const set = new Set([1]);
  assert.notSame(set.difference(new Set()), set);

  assert.deepEqual(from(new Set([1, 2, 3]).difference(new Set([4, 5]))), [1, 2, 3]);
  assert.deepEqual(from(new Set([1, 2, 3]).difference(new Set([3, 4]))), [1, 2]);
  assert.deepEqual(from(new Set([1, 2, 3]).difference(createSetLike([3, 4]))), [1, 2]);
  assert.deepEqual(from(new Set([1, 2, 3]).difference(createSetLike([3, 4]))), [1, 2]);

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

  // A WebKit bug occurs when `this` is updated while Set.prototype.difference is being executed
  // https://bugs.webkit.org/show_bug.cgi?id=288595
  const values = [2];
  const setLike = {
    size: values.length,
    has() { return true; },
    keys() {
      let index = 0;
      return {
        next() {
          const done = index >= values.length;
          if (baseSet.has(1)) baseSet.clear();
          return { done, value: values[index++] };
        },
      };
    },
  };

  const baseSet = new Set([1, 2, 3, 4]);
  const result = baseSet.difference(setLike);
  assert.deepEqual(from(result), [1, 3, 4], 'incorrect behavior when this updated while Set#difference is being executed');
});
