import { STRICT } from '../helpers/constants';

import Symbol from 'core-js-pure/es/symbol';
import withReversed from 'core-js-pure/features/array/with-reversed';

QUnit.test('Array#withReversed', assert => {
  assert.isFunction(withReversed);

  let array = [1, 2];
  assert.ok(withReversed(array) !== array, 'immutable');
  assert.deepEqual(withReversed([1, 2.2, 3.3]), [3.3, 2.2, 1], 'basic');

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

  assert.deepEqual(withReversed(array), expected, 'non-array target');

  array = [1];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.ok(withReversed(array) instanceof Array, 'non-generic');

  if (STRICT) {
    assert.throws(() => withReversed(null, () => { /* empty */ }, 1), TypeError);
    assert.throws(() => withReversed(undefined, () => { /* empty */ }, 1), TypeError);
  }
});
