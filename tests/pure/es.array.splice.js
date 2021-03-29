import { STRICT } from '../helpers/constants';

import splice from 'core-js-pure/full/array/splice';
import Symbol from 'core-js-pure/full/symbol';

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
  if (STRICT) {
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
