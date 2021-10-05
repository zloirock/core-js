import { STRICT } from '../helpers/constants';

QUnit.test('Array#withSpliced', assert => {
  const { withSpliced } = Array.prototype;

  assert.isFunction(withSpliced);
  assert.arity(withSpliced, 2);
  assert.name(withSpliced, 'withSpliced');
  assert.looksNative(withSpliced);
  assert.nonEnumerable(Array.prototype, 'withSpliced');

  let array = [1, 2, 3, 4, 5];
  assert.ok(array.withSpliced(2) !== array, 'immutable');

  assert.deepEqual([1, 2, 3, 4, 5].withSpliced(2), [1, 2]);
  assert.deepEqual([1, 2, 3, 4, 5].withSpliced(-2), [1, 2, 3]);
  assert.deepEqual([1, 2, 3, 4, 5].withSpliced(2, 2), [1, 2, 5]);
  assert.deepEqual([1, 2, 3, 4, 5].withSpliced(2, -2), [1, 2, 3, 4, 5]);
  assert.deepEqual([1, 2, 3, 4, 5].withSpliced(2, 2, 6, 7), [1, 2, 6, 7, 5]);

  if (STRICT) {
    assert.throws(() => withSpliced.call(null), TypeError);
    assert.throws(() => withSpliced.call(undefined), TypeError);
  }
  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };

  assert.ok(array.withSpliced() instanceof Array, 'non-generic');

  assert.ok('withSpliced' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
