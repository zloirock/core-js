import { REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR, STRICT } from '../helpers/constants.js';

import Symbol from '@core-js/pure/es/symbol';
import splice from '@core-js/pure/es/array/splice';

QUnit.test('Array#splice', assert => {
  assert.isFunction(splice);
  let array = [1, 2, 3, 4, 5];
  assert.deepEqual(splice(array, 2), [3, 4, 5]);
  assert.deepEqual(array, [1, 2]);
  array = [1, 2, 3, 4, 5];
  assert.deepEqual(splice(array, -2), [4, 5]);
  assert.deepEqual(array, [1, 2, 3]);
  array = [1, 2, 3, 4, 5];
  assert.deepEqual(splice(array, 2, 2), [3, 4]);
  assert.deepEqual(array, [1, 2, 5]);
  array = [1, 2, 3, 4, 5];
  assert.deepEqual(splice(array, 2, -2), []);
  assert.deepEqual(array, [1, 2, 3, 4, 5]);
  array = [1, 2, 3, 4, 5];
  assert.deepEqual(splice(array, 2, 2, 6, 7), [3, 4]);
  assert.deepEqual(array, [1, 2, 6, 7, 5]);
  // ES6 semantics
  array = [0, 1, 2];
  assert.deepEqual(splice(array, 0), [0, 1, 2]);
  array = [0, 1, 2];
  assert.deepEqual(splice(array, 1), [1, 2]);
  array = [0, 1, 2];
  assert.deepEqual(splice(array, 2), [2]);
  if (STRICT) {
    if (REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR) {
      assert.throws(() => splice(Object.defineProperty([1, 2, 3], 'length', { writable: false }), 1, 1), TypeError, 'non-writable length');
    }
    assert.throws(() => splice(null), TypeError);
    assert.throws(() => splice(undefined), TypeError);
  }
  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.same(splice(array).foo, 1, '@@species');
});
