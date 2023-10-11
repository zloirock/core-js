import { createSetLike } from '../helpers/helpers.js';

import from from '@core-js/pure/es/array/from';
import Set from '@core-js/pure/es/set';

QUnit.test('Set#intersection', assert => {
  const { intersection } = Set.prototype;

  assert.isFunction(intersection);
  assert.arity(intersection, 1);
  assert.name(intersection, 'intersection');
  assert.nonEnumerable(Set.prototype, 'intersection');

  const set = new Set([1]);
  assert.notSame(set.intersection(new Set()), set);

  assert.deepEqual(from(new Set([1, 2, 3]).intersection(new Set([4, 5]))), []);
  assert.deepEqual(from(new Set([1, 2, 3]).intersection(new Set([2, 3, 4]))), [2, 3]);
  assert.deepEqual(from(new Set([1, 2, 3]).intersection(createSetLike([4, 5]))), []);
  assert.deepEqual(from(new Set([1, 2, 3]).intersection(createSetLike([2, 3, 4]))), [2, 3]);

  assert.deepEqual(from(new Set([1, 2, 3]).intersection(new Set([3, 2]))), [3, 2]);
  assert.deepEqual(from(new Set([1, 2, 3]).intersection(new Set([3, 2, 1]))), [1, 2, 3]);
  assert.deepEqual(from(new Set([1, 2, 3]).intersection(new Set([3, 2, 1, 0]))), [1, 2, 3]);
  assert.deepEqual(from(new Set([1, 2, 3]).intersection(createSetLike([3, 2]))), [3, 2]);
  assert.deepEqual(from(new Set([1, 2, 3]).intersection(createSetLike([3, 2, 1]))), [1, 2, 3]);
  assert.deepEqual(from(new Set([1, 2, 3]).intersection(createSetLike([3, 2, 1, 0]))), [1, 2, 3]);

  assert.deepEqual(from(new Set([42, 43]).intersection({
    size: Infinity,
    has() {
      return true;
    },
    keys() {
      throw new Error('Unexpected call to |keys| method');
    },
  })), [42, 43]);

  assert.throws(() => new Set().intersection({
    size: -Infinity,
    has() {
      return true;
    },
    keys() {
      throw new Error('Unexpected call to |keys| method');
    },
  }));

  assert.throws(() => new Set([1, 2, 3]).intersection(), TypeError);

  assert.throws(() => intersection.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => intersection.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => intersection.call(null, [1, 2, 3]), TypeError);
});
