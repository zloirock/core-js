import { DESCRIPTORS, MAX_SAFE_INTEGER, PROTO, REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR, STRICT } from '../helpers/constants.js';
import { createSpeciesShrinkingArray } from '../helpers/helpers.js';

import Symbol from 'core-js-pure/es/symbol';
import splice from 'core-js-pure/es/array/splice';
import defineProperty from 'core-js-pure/es/object/define-property';

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
      assert.throws(() => splice(defineProperty([1, 2, 3], 'length', { writable: false }), 1, 1), TypeError, 'non-writable length');
    }
    assert.throws(() => splice(null), TypeError);
    assert.throws(() => splice(undefined), TypeError);
  }
  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function (length) {
    return { foo: length };
  } };
  assert.same(splice(array).foo, 0, '@@species');
  array[0] = 1;
  assert.same(splice(array, 0).foo, 1, 'species receives the deletion count');
  if (DESCRIPTORS) {
    let speciesReads = 0;
    function Constructor() { /* empty */ }
    defineProperty(Constructor, Symbol.species, { get() {
      speciesReads++;
      return null;
    } });
    array = [1, 2];
    array.constructor = Constructor;
    assert.deepEqual(splice(array, 0, 1, 3, 4), [1], 'uses the default species');
    assert.same(speciesReads, 1, 'reads species once');
  }
  if (DESCRIPTORS && PROTO) {
    assert.same(splice(createSpeciesShrinkingArray(), 0, 3)[2], 'inherited', 'copies inherited elements after species lookup');
  }
});

QUnit.test('Array#splice, maximum safe length', assert => {
  const object = { length: MAX_SAFE_INTEGER };
  assert.throws(() => splice(object, -1, 1, 1, 2), TypeError, 'rejects overflow before writing');
  assert.same(object.length, MAX_SAFE_INTEGER, 'length unchanged on overflow');
  assert.false(MAX_SAFE_INTEGER - 1 in object, 'last index untouched');
  assert.false(MAX_SAFE_INTEGER in object, 'no index appended');
  assert.throws(() => splice(object, MAX_SAFE_INTEGER, 0, 1), TypeError, 'one insertion can also overflow');
  assert.same(splice(object, -4, 4, 1, 2, 3, 4).length, 4, 'balanced replacement at the limit');
  assert.same(object.length, MAX_SAFE_INTEGER, 'keeps the exact length');
  assert.same(object[MAX_SAFE_INTEGER - 1], 4, 'writes the last item');
});

QUnit.test('Array#splice, zero-length species', assert => {
  function check(array, args) {
    let calls = 0;
    function Species(length) {
      calls++;
      assert.same(length, 0, 'species receives positive zero');
      return {};
    }
    array.constructor = { [Symbol.species]: Species };
    assert.same(splice(array, ...args).length, 0, 'the result gets positive zero length');
    assert.same(calls, 1, 'species is called once');
  }
  for (const args of [[], [0], [-0], [0, 0], [0, -0], [0, -0.5], [0, '-0'], [0, -1]]) check([], args);
  // V8 7.1 - 8.1 keep -0 only while elements follow the start
  for (const args of [[0, -0], [1, -0], [0, -0.5], [0, '-0'], [0, -0, 3], [0, -0, 3, 4]]) check([1, 2], args);
});
