import { createIterable } from '../helpers/helpers';

import Set from 'core-js-pure/full/set';

QUnit.test('Set#isDisjointFrom', assert => {
  const { isDisjointFrom } = Set.prototype;

  assert.isFunction(isDisjointFrom);
  assert.arity(isDisjointFrom, 1);
  assert.name(isDisjointFrom, 'isDisjointFrom');
  assert.nonEnumerable(Set.prototype, 'isDisjointFrom');

  assert.ok(new Set([1]).isDisjointFrom([2]));
  assert.ok(!new Set([1]).isDisjointFrom([1]));
  assert.ok(new Set([1, 2, 3]).isDisjointFrom([4, 5, 6]));
  assert.ok(!new Set([1, 2, 3]).isDisjointFrom([5, 4, 3]));

  assert.ok(new Set([1]).isDisjointFrom(createIterable([2])));
  assert.ok(!new Set([1]).isDisjointFrom(createIterable([1])));

  assert.throws(() => new Set([1, 2, 3]).isDisjointFrom(), TypeError);
  assert.throws(() => isDisjointFrom.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => isDisjointFrom.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => isDisjointFrom.call(null, [1, 2, 3]), TypeError);
});
