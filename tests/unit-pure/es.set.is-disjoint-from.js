import { createSetLike } from '../helpers/helpers.js';

import Set from 'core-js-pure/es/set';

QUnit.test('Set#isDisjointFrom', assert => {
  const { isDisjointFrom } = Set.prototype;

  assert.isFunction(isDisjointFrom);
  assert.arity(isDisjointFrom, 1);
  assert.name(isDisjointFrom, 'isDisjointFrom');
  assert.nonEnumerable(Set.prototype, 'isDisjointFrom');

  assert.true(new Set([1]).isDisjointFrom(new Set([2])));
  assert.false(new Set([1]).isDisjointFrom(new Set([1])));
  assert.true(new Set([1, 2, 3]).isDisjointFrom(new Set([4, 5, 6])));
  assert.false(new Set([1, 2, 3]).isDisjointFrom(new Set([5, 4, 3])));
  assert.true(new Set([1]).isDisjointFrom(createSetLike([2])));
  assert.false(new Set([1]).isDisjointFrom(createSetLike([1])));
  assert.true(new Set([1, 2, 3]).isDisjointFrom(createSetLike([4, 5, 6])));
  assert.false(new Set([1, 2, 3]).isDisjointFrom(createSetLike([5, 4, 3])));

  assert.false(new Set([42, 43]).isDisjointFrom({
    size: Infinity,
    has() {
      return true;
    },
    keys() {
      throw new Error('Unexpected call to |keys| method');
    },
  }));

  assert.throws(() => new Set().isDisjointFrom({
    size: -Infinity,
    has() {
      return true;
    },
    keys() {
      throw new Error('Unexpected call to |keys| method');
    },
  }));

  let closed = false;
  assert.false(new Set([1, 2, 3, 4]).isDisjointFrom({
    size: 3,
    has() { return true; },
    keys() {
      let index = 0;
      return {
        next() {
          return { value: [5, 1, 6][index++], done: index > 3 };
        },
        return() {
          closed = true;
          return { done: true };
        },
      };
    },
  }));
  assert.true(closed, 'iterator is closed on early exit');

  assert.throws(() => new Set([1, 2, 3]).isDisjointFrom(), TypeError);
  assert.throws(() => isDisjointFrom.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => isDisjointFrom.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => isDisjointFrom.call(null, [1, 2, 3]), TypeError);
});
