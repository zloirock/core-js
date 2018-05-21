import { createIterable } from '../helpers/helpers';

QUnit.test('Set#symmetricDifference', assert => {
  const { symmetricDifference } = Set.prototype;
  const { from } = Array;

  assert.isFunction(symmetricDifference);
  assert.arity(symmetricDifference, 1);
  assert.name(symmetricDifference, 'symmetricDifference');
  assert.looksNative(symmetricDifference);
  assert.nonEnumerable(Set.prototype, 'symmetricDifference');

  const set = new Set([1]);
  assert.ok(set.symmetricDifference([2]) !== set);

  assert.deepEqual(from(new Set([1, 2, 3]).symmetricDifference([4, 5])), [1, 2, 3, 4, 5]);
  assert.deepEqual(from(new Set([1, 2, 3]).symmetricDifference([3, 4])), [1, 2, 4]);
  assert.deepEqual(from(new Set([1, 2, 3]).symmetricDifference(createIterable([3, 4]))), [1, 2, 4]);

  assert.throws(() => new Set([1, 2, 3]).symmetricDifference(), TypeError);

  assert.throws(() => symmetricDifference.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => symmetricDifference.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => symmetricDifference.call(null, [1, 2, 3]), TypeError);
});
