import { STRICT } from '../helpers/constants';

QUnit.test('Array#withAt', assert => {
  const { withAt } = Array.prototype;

  assert.isFunction(withAt);
  assert.arity(withAt, 2);
  assert.name(withAt, 'withAt');
  assert.looksNative(withAt);
  assert.nonEnumerable(Array.prototype, 'withAt');

  let array = [1, 2, 3, 4, 5];
  assert.ok(array.withAt(2, 1) !== array, 'immutable');

  assert.deepEqual([1, 2, 3, 4, 5].withAt(2, 6), [1, 2, 6, 4, 5]);
  assert.deepEqual([1, 2, 3, 4, 5].withAt(-2, 6), [1, 2, 3, 6, 5]);

  assert.throws(() => [1, 2, 3, 4, 5].withAt(5, 6), RangeError);
  assert.throws(() => [1, 2, 3, 4, 5].withAt(-6, 6), RangeError);
  assert.throws(() => [1, 2, 3, 4, 5].withAt('1', 6), RangeError);

  if (STRICT) {
    assert.throws(() => withAt.call(null, 1, 2), TypeError);
    assert.throws(() => withAt.call(undefined, 1, 2), TypeError);
  }

  array = [1, 2];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.ok(array.withAt(1, 2) instanceof Array, 'non-generic');

  assert.ok('withAt' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
