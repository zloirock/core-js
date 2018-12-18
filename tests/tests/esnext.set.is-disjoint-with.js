import { createIterable } from '../helpers/helpers';

QUnit.test('Set#isDisjointWith', assert => {
  const { isDisjointWith } = Set.prototype;

  assert.isFunction(isDisjointWith);
  assert.arity(isDisjointWith, 1);
  assert.name(isDisjointWith, 'isDisjointWith');
  assert.looksNative(isDisjointWith);
  assert.nonEnumerable(Set.prototype, 'isDisjointWith');

  assert.ok(new Set([1]).isDisjointWith([2]));
  assert.ok(!new Set([1]).isDisjointWith([1]));
  assert.ok(new Set([1, 2, 3]).isDisjointWith([4, 5, 6]));
  assert.ok(!new Set([1, 2, 3]).isDisjointWith([5, 4, 3]));

  assert.ok(new Set([1]).isDisjointWith(createIterable([2])));
  assert.ok(!new Set([1]).isDisjointWith(createIterable([1])));

  assert.throws(() => new Set([1, 2, 3]).isDisjointWith(), TypeError);
  assert.throws(() => isDisjointWith.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => isDisjointWith.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => isDisjointWith.call(null, [1, 2, 3]), TypeError);
});
