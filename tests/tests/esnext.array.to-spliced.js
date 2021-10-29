import { STRICT } from '../helpers/constants';

QUnit.test('Array#toSpliced', assert => {
  const { toSpliced } = Array.prototype;

  assert.isFunction(toSpliced);
  assert.arity(toSpliced, 2);
  assert.name(toSpliced, 'toSpliced');
  assert.looksNative(toSpliced);
  assert.nonEnumerable(Array.prototype, 'toSpliced');

  let array = [1, 2, 3, 4, 5];
  assert.ok(array.toSpliced(2) !== array, 'immutable');

  assert.deepEqual([1, 2, 3, 4, 5].toSpliced(2), [1, 2]);
  assert.deepEqual([1, 2, 3, 4, 5].toSpliced(-2), [1, 2, 3]);
  assert.deepEqual([1, 2, 3, 4, 5].toSpliced(2, 2), [1, 2, 5]);
  assert.deepEqual([1, 2, 3, 4, 5].toSpliced(2, -2), [1, 2, 3, 4, 5]);
  assert.deepEqual([1, 2, 3, 4, 5].toSpliced(2, 2, 6, 7), [1, 2, 6, 7, 5]);

  if (STRICT) {
    assert.throws(() => toSpliced.call(null), TypeError);
    assert.throws(() => toSpliced.call(undefined), TypeError);
  }
  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };

  assert.ok(array.toSpliced() instanceof Array, 'non-generic');

  assert.ok('toSpliced' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
