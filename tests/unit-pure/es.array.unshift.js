import { REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR, STRICT } from '../helpers/constants.js';

import unshift from 'core-js-pure/es/array/virtual/unshift';
import defineProperty from 'core-js-pure/es/object/define-property';
import preventExtensions from 'core-js-pure/es/object/prevent-extensions';

QUnit.test('Array#unshift', assert => {
  assert.isFunction(unshift);

  assert.same(unshift.call([1], 0), 2, 'proper result');

  let touched = false;
  const accessor = () => { touched = true; };
  unshift.call(defineProperty({ length: 1 }, 0, { get: accessor, set: accessor }));
  assert.false(touched, 'elements are not touched without arguments');

  // an implementation that moves elements without arguments would iterate up to this length
  if (!touched) {
    const object = { length: 0x100000000 };
    assert.same(unshift.call(object), 0x100000000, 'proper ToLength #1');
    assert.same(object.length, 0x100000000, 'proper ToLength #2');
  }

  const array = [1, 2];
  assert.same(unshift.call(array, 3, 4), 4, 'some arguments, result');
  assert.arrayEqual(array, [3, 4, 1, 2], 'some arguments, content');
  assert.same(unshift.call(array), 4, 'without arguments, result');
  assert.arrayEqual(array, [3, 4, 1, 2], 'without arguments, content');

  // eslint-disable-next-line no-sparse-arrays -- testing
  const sparse = [1, , 3];
  unshift.call(sparse, 0);
  assert.same(sparse[0], 0, 'sparse array, new element');
  assert.same(sparse[1], 1, 'sparse array, moved element #1');
  assert.false(2 in sparse, 'sparse array, moved hole');
  assert.same(sparse[3], 3, 'sparse array, moved element #2');

  const arrayLike = { 0: 1, 1: 2, length: 2 };
  assert.same(unshift.call(arrayLike, 3, 4), 4, 'array-like, result');
  assert.deepEqual(arrayLike, { 0: 3, 1: 4, 2: 1, 3: 2, length: 4 }, 'array-like, content');

  const sparseLike = { 0: 1, 2: 3, length: 3 };
  unshift.call(sparseLike, 0);
  assert.deepEqual(sparseLike, { 0: 0, 1: 1, 3: 3, length: 4 }, 'sparse array-like, content');

  if (STRICT) {
    if (REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR) {
      assert.throws(() => unshift.call(defineProperty([], 'length', { writable: false }), 1), TypeError, 'non-writable length, with arg');
      assert.throws(() => unshift.call(defineProperty([], 'length', { writable: false })), TypeError, 'non-writable length, without arg');
    }

    assert.throws(() => unshift.call(preventExtensions([1]), 0), TypeError, 'non-extensible array');
    assert.throws(() => unshift.call(defineProperty([1, 2], 1, { writable: false }), 0), TypeError, 'non-writable element');

    assert.throws(() => unshift.call(null), TypeError);
    assert.throws(() => unshift.call(undefined), TypeError);
  }
});
