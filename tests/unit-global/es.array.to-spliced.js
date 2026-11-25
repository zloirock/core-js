import { DESCRIPTORS, MAX_SAFE_INTEGER, STRICT } from '../helpers/constants.js';

QUnit.test('Array#toSpliced', assert => {
  const { toSpliced } = Array.prototype;

  assert.isFunction(toSpliced);
  assert.arity(toSpliced, 2);
  assert.name(toSpliced, 'toSpliced');
  assert.looksNative(toSpliced);
  assert.nonEnumerable(Array.prototype, 'toSpliced');

  let array = [1, 2, 3, 4, 5];
  assert.notSame(array.toSpliced(2), array, 'immutable');

  assert.deepEqual([1, 2, 3, 4, 5].toSpliced(2), [1, 2]);
  assert.deepEqual([1, 2, 3, 4, 5].toSpliced(-2), [1, 2, 3]);
  assert.deepEqual([1, 2, 3, 4, 5].toSpliced(2, 2), [1, 2, 5]);
  assert.deepEqual([1, 2, 3, 4, 5].toSpliced(2, -2), [1, 2, 3, 4, 5]);
  assert.deepEqual([1, 2, 3, 4, 5].toSpliced(2, 2, 6, 7), [1, 2, 6, 7, 5]);

  // eslint-disable-next-line no-sparse-arrays -- testing
  const copy = [1, , 3].toSpliced(2, 1, 4, 5);
  assert.same(copy[1], undefined, 'copies a hole as undefined');
  assert.true(Object.hasOwn(copy, 1), 'creates an own property for the hole');

  if (DESCRIPTORS) {
    const source = Object.defineProperty({ length: 2, 1: 'kept' }, 0, { get() { throw new Error(); } });
    assert.deepEqual(toSpliced.call(source, 0, 1), ['kept'], 'skips the deleted element');
  }

  if (STRICT) {
    assert.throws(() => toSpliced.call(null), TypeError);
    assert.throws(() => toSpliced.call(undefined), TypeError);
  }
  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };

  assert.true(array.toSpliced() instanceof Array, 'non-generic');

  assert.true('toSpliced' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});

QUnit.test('Array#toSpliced, maximum safe length', assert => {
  const object = { length: MAX_SAFE_INTEGER, [MAX_SAFE_INTEGER - 2]: 'next', [MAX_SAFE_INTEGER - 1]: 'last' };
  assert.deepEqual(Array.prototype.toSpliced.call(object, 0, MAX_SAFE_INTEGER, 1, 2, 3, 4), [1, 2, 3, 4], 'exact result length');
  assert.deepEqual(Array.prototype.toSpliced.call(object, 0, MAX_SAFE_INTEGER - 1, 1, 2), [1, 2, 'last'], 'keeps the last source element');
  assert.deepEqual(Array.prototype.toSpliced.call(object, 0, MAX_SAFE_INTEGER - 3, 1, 2, 3), [1, 2, 3, undefined, 'next', 'last'], 'exact source indices');
  assert.throws(() => Array.prototype.toSpliced.call(object), RangeError, 'safe length too large for an array');
  assert.throws(() => Array.prototype.toSpliced.call(object, -1, 1, 1, 2), TypeError, 'length exceeds the safe integer limit');
});
