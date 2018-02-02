import { createIterable } from '../helpers/helpers';

import Set from 'core-js-pure/fn/set';
import from from 'core-js-pure/fn/array/from';

QUnit.test('Set#intersect', assert => {
  const { intersect } = Set.prototype;

  assert.isFunction(intersect);
  assert.arity(intersect, 1);
  if ('name' in intersect) assert.name(intersect, 'intersect');
  assert.nonEnumerable(Set.prototype, 'intersect');

  const set = new Set([1]);
  assert.ok(set.intersect([2]) !== set);

  assert.deepEqual(from(new Set([1, 2, 3]).intersect([4, 5])), []);
  assert.deepEqual(from(new Set([1, 2, 3]).intersect([2, 3, 4])), [2, 3]);
  assert.deepEqual(from(new Set([1, 2, 3]).intersect(createIterable([2, 3, 4]))), [2, 3]);

  assert.throws(() => new Set([1, 2, 3]).intersect(), TypeError);

  assert.throws(() => intersect.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => intersect.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => intersect.call(null, [1, 2, 3]), TypeError);
});
