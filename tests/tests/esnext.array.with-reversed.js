import { STRICT } from '../helpers/constants';

QUnit.test('Array#withReversed', assert => {
  const { withReversed } = Array.prototype;

  assert.isFunction(withReversed);
  assert.arity(withReversed, 0);
  assert.name(withReversed, 'withReversed');
  assert.looksNative(withReversed);
  assert.nonEnumerable(Array.prototype, 'withReversed');

  let array = [1, 2];
  assert.ok(array.withReversed() !== array, 'immutable');

  assert.deepEqual([1, 2.2, 3.3].withReversed(), [3.3, 2.2, 1], 'basic');

  const object = {};

  array = {
    0: undefined,
    1: 2,
    2: 1,
    3: 'X',
    4: -1,
    5: 'a',
    6: true,
    7: object,
    8: NaN,
    10: Infinity,
    length: 11,
  };

  const expected = [
    Infinity,
    undefined,
    NaN,
    object,
    true,
    'a',
    -1,
    'X',
    1,
    2,
    undefined,
  ];

  assert.deepEqual(withReversed.call(array), expected, 'non-array target');

  array = [1];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.ok(array.withReversed() instanceof Array, 'non-generic');

  if (STRICT) {
    assert.throws(() => withReversed.call(null, () => { /* empty */ }, 1), TypeError);
    assert.throws(() => withReversed.call(undefined, () => { /* empty */ }, 1), TypeError);
  }

  assert.ok('withReversed' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
