import { DESCRIPTORS, PROTO, REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR, STRICT } from '../helpers/constants.js';
import { createSpeciesShrinkingArray } from '../helpers/helpers.js';

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
  if (STRICT) {
    if (REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR) {
      assert.throws(() => splice.call(defineProperty([1, 2, 3], 'length', { writable: false }), 1, 1), TypeError, 'non-writable length');
    }
    assert.throws(() => splice.call(null), TypeError);
    assert.throws(() => splice.call(undefined), TypeError);
  }
  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function (length) {
    return { foo: length };
  } };
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- @@species
  assert.same(array.splice().foo, 0, '@@species');
  array[0] = 1;
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- @@species
  assert.same(array.splice(0).foo, 1, 'species receives the deletion count');
  if (DESCRIPTORS && PROTO) {
    assert.same(createSpeciesShrinkingArray().splice(0, 3)[2], 'inherited', 'copies inherited elements after species lookup');
  }
});

QUnit.test('Array#splice, zero-length species', assert => {
  for (const args of [[], [0], [-0], [0, 0], [0, -0], [0, -0.5], [0, -1]]) {
    const array = [];
    let calls = 0;
    function Species(length) {
      calls++;
      assert.same(length, 0, 'species receives positive zero');
      return [];
    }
    array.constructor = { [Symbol.species]: Species };
    Array.prototype.splice.apply(array, args);
    assert.same(calls, 1, 'species is called once');
  }
});
