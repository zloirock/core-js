import { REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR } from '../helpers/constants.js';

const { defineProperty } = Object;

QUnit.test('Array#splice', assert => {
  const { splice } = Array.prototype;
  assert.isFunction(splice);
  assert.arity(splice, 2);
  assert.name(splice, 'splice');
  assert.looksNative(splice);
  assert.nonEnumerable(Array.prototype, 'splice');
  let array = [1, 2, 3, 4, 5];
  assert.deepEqual(array.splice(2), [3, 4, 5]);
  assert.deepEqual(array, [1, 2]);
  array = [1, 2, 3, 4, 5];
  assert.deepEqual(array.splice(-2), [4, 5]);
  assert.deepEqual(array, [1, 2, 3]);
  array = [1, 2, 3, 4, 5];
  assert.deepEqual(array.splice(2, 2), [3, 4]);
  assert.deepEqual(array, [1, 2, 5]);
  array = [1, 2, 3, 4, 5];
  assert.deepEqual(array.splice(2, -2), []);
  assert.deepEqual(array, [1, 2, 3, 4, 5]);
  array = [1, 2, 3, 4, 5];
  assert.deepEqual(array.splice(2, 2, 6, 7), [3, 4]);
  assert.deepEqual(array, [1, 2, 6, 7, 5]);
  // ES6 semantics
  array = [0, 1, 2];
  assert.deepEqual(array.splice(0), [0, 1, 2]);
  array = [0, 1, 2];
  assert.deepEqual(array.splice(1), [1, 2]);
  array = [0, 1, 2];
  assert.deepEqual(array.splice(2), [2]);

  if (REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR) {
    assert.throws(() => splice.call(defineProperty([1, 2, 3], 'length', { writable: false }), 1, 1), TypeError, 'non-writable length');
  }
  assert.throws(() => splice.call(null), TypeError);
  assert.throws(() => splice.call(undefined), TypeError);

  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- @@species
  assert.same(array.splice().foo, 1, '@@species');
});
