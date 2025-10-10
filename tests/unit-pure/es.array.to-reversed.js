import Symbol from '@core-js/pure/es/symbol';
import toReversed from '@core-js/pure/es/array/to-reversed';

QUnit.test('Array#toReversed', assert => {
  assert.isFunction(toReversed);

  let array = [1, 2];
  assert.notSame(toReversed(array), array, 'immutable');
  assert.deepEqual(toReversed([1, 2.2, 3.3]), [3.3, 2.2, 1], 'basic');

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

  assert.deepEqual(toReversed(array), expected, 'non-array target');

  array = [1];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.true(toReversed(array) instanceof Array, 'non-generic');

  assert.throws(() => toReversed(null, () => { /* empty */ }, 1), TypeError);
  assert.throws(() => toReversed(undefined, () => { /* empty */ }, 1), TypeError);
});
