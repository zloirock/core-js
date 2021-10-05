import { STRICT } from '../helpers/constants';

import Symbol from 'core-js-pure/es/symbol';
import withSpliced from 'core-js-pure/features/array/with-spliced';

QUnit.test('Array#withSpliced', assert => {
  assert.isFunction(withSpliced);

  let array = [1, 2, 3, 4, 5];
  assert.ok(withSpliced(array, 2) !== array);
  assert.deepEqual(withSpliced([1, 2, 3, 4, 5], 2), [1, 2]);
  assert.deepEqual(withSpliced([1, 2, 3, 4, 5], -2), [1, 2, 3]);
  assert.deepEqual(withSpliced([1, 2, 3, 4, 5], 2, 2), [1, 2, 5]);
  assert.deepEqual(withSpliced([1, 2, 3, 4, 5], 2, -2), [1, 2, 3, 4, 5]);
  assert.deepEqual(withSpliced([1, 2, 3, 4, 5], 2, 2, 6, 7), [1, 2, 6, 7, 5]);

  if (STRICT) {
    assert.throws(() => withSpliced(null), TypeError);
    assert.throws(() => withSpliced(undefined), TypeError);
  }

  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.ok(withSpliced(array) instanceof Array, 'non-generic');
});
