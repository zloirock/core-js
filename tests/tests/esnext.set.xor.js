import { createIterable } from '../helpers/helpers';

QUnit.test('Set#xor', assert => {
  const { xor } = Set.prototype;
  const { from } = Array;

  assert.isFunction(xor);
  assert.arity(xor, 1);
  assert.name(xor, 'xor');
  assert.looksNative(xor);
  assert.nonEnumerable(Set.prototype, 'xor');

  const set = new Set([1]);
  assert.ok(set.xor([2]) !== set);

  assert.deepEqual(from(new Set([1, 2, 3]).xor([4, 5])), [1, 2, 3, 4, 5]);
  assert.deepEqual(from(new Set([1, 2, 3]).xor([3, 4])), [1, 2, 4]);
  assert.deepEqual(from(new Set([1, 2, 3]).xor(createIterable([3, 4]))), [1, 2, 4]);

  assert.throws(() => new Set([1, 2, 3]).xor(), TypeError);

  assert.throws(() => xor.call({}, [1, 2, 3]), TypeError);
  assert.throws(() => xor.call(undefined, [1, 2, 3]), TypeError);
  assert.throws(() => xor.call(null, [1, 2, 3]), TypeError);
});
