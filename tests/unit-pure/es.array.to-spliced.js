import { DESCRIPTORS, MAX_SAFE_INTEGER, STRICT } from '../helpers/constants.js';

import Symbol from 'core-js-pure/es/symbol';
import toSpliced from 'core-js-pure/es/array/to-spliced';
import defineProperty from 'core-js-pure/es/object/define-property';

QUnit.test('Array#toSpliced', assert => {
  assert.isFunction(toSpliced);

  let array = [1, 2, 3, 4, 5];
  assert.notSame(toSpliced(array, 2), array);
  assert.deepEqual(toSpliced([1, 2, 3, 4, 5], 2), [1, 2]);
  assert.deepEqual(toSpliced([1, 2, 3, 4, 5], -2), [1, 2, 3]);
  assert.deepEqual(toSpliced([1, 2, 3, 4, 5], 2, 2), [1, 2, 5]);
  assert.deepEqual(toSpliced([1, 2, 3, 4, 5], 2, -2), [1, 2, 3, 4, 5]);
  assert.deepEqual(toSpliced([1, 2, 3, 4, 5], 2, 2, 6, 7), [1, 2, 6, 7, 5]);

  if (DESCRIPTORS) {
    const source = defineProperty({ length: 2, 1: 'kept' }, 0, { get() { throw new Error(); } });
    assert.deepEqual(toSpliced(source, 0, 1), ['kept'], 'skips the deleted element');
  }

  if (STRICT) {
    assert.throws(() => toSpliced(null), TypeError);
    assert.throws(() => toSpliced(undefined), TypeError);
  }

  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.true(toSpliced(array) instanceof Array, 'non-generic');
});

QUnit.test('Array#toSpliced, maximum safe length', assert => {
  const object = { length: MAX_SAFE_INTEGER, [MAX_SAFE_INTEGER - 2]: 'next', [MAX_SAFE_INTEGER - 1]: 'last' };
  assert.deepEqual(toSpliced(object, 0, MAX_SAFE_INTEGER, 1, 2, 3, 4), [1, 2, 3, 4], 'exact result length');
  assert.deepEqual(toSpliced(object, 0, MAX_SAFE_INTEGER - 1, 1, 2), [1, 2, 'last'], 'keeps the last source element');
  assert.deepEqual(toSpliced(object, 0, MAX_SAFE_INTEGER - 3, 1, 2, 3), [1, 2, 3, undefined, 'next', 'last'], 'exact source indices');
  assert.throws(() => toSpliced(object), RangeError, 'safe length too large for an array');
  assert.throws(() => toSpliced(object, -1, 1, 1, 2), TypeError, 'length exceeds the safe integer limit');
});
