import { createIterable } from '../helpers/helpers';

import Set from 'core-js-pure/full/set';
import from from 'core-js-pure/full/array/from';

QUnit.test('Set#difference', assert => {
  const { difference } = Set.prototype;

  assert.isFunction(difference);
  assert.arity(difference, 1);
  assert.name(difference, 'difference');
  assert.nonEnumerable(Set.prototype, 'difference');

  const set = new Set([1]);
  assert.ok(set.difference([2]) !== set);

  assert.deepEqual(from(new Set([1, 2, 3]).difference([4, 5])), [1, 2, 3]);
  assert.deepEqual(from(new Set([1, 2, 3]).difference([3, 4])), [1, 2]);
  assert.deepEqual(from(new Set([1, 2, 3]).difference(createIterable([3, 4]))), [1, 2]);

  assert.throws(() => new Set([1, 2, 3]).difference(), TypeError);

  assert.throws(() => difference.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => difference.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => difference.call(null, [1, 2, 3]), TypeError);
});
