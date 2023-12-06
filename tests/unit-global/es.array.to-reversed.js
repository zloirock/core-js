QUnit.test('Array#toReversed', assert => {
  const { toReversed } = Array.prototype;

  assert.isFunction(toReversed);
  assert.arity(toReversed, 0);
  assert.name(toReversed, 'toReversed');
  assert.looksNative(toReversed);
  assert.nonEnumerable(Array.prototype, 'toReversed');

  let array = [1, 2];
  assert.notSame(array.toReversed(), array, 'immutable');

  assert.deepEqual([1, 2.2, 3.3].toReversed(), [3.3, 2.2, 1], 'basic');

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

  assert.deepEqual(toReversed.call(array), expected, 'non-array target');

  array = [1];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.true(array.toReversed() instanceof Array, 'non-generic');

  assert.throws(() => toReversed.call(null, () => { /* empty */ }, 1), TypeError);
  assert.throws(() => toReversed.call(undefined, () => { /* empty */ }, 1), TypeError);

  assert.true('toReversed' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
