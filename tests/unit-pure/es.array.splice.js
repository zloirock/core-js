import { DESCRIPTORS, GLOBAL, MAX_SAFE_INTEGER, PROTO, REDEFINABLE_ARRAY_LENGTH_DESCRIPTOR, STRICT } from '../helpers/constants.js';
import { createArrayWithProxyConstructor, createSpeciesShrinkingArray, getSplicePrototypeReadLimit } from '../helpers/helpers.js';

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
  if (DESCRIPTORS && PROTO) {
    assert.same(splice(createSpeciesShrinkingArray(), 0, 3)[2], 'inherited', 'copies inherited elements after species lookup');
  }
});

if (typeof GLOBAL.Proxy == 'function') QUnit.test('Array#splice, proxy constructor', assert => {
  const { array, reads } = createArrayWithProxyConstructor(Symbol.species);
  assert.deepEqual(splice(array, 0, 1, 3, 4), [1], 'uses the default species');
  assert.true(reads.prototype <= getSplicePrototypeReadLimit(Symbol.species), 'adds no constructor prototype reads');
  assert.same(reads.species, 1, 'reads species once');
  const keys = [];
  const source = new GLOBAL.Proxy(array, { get(target, key) {
    keys.push(key);
    return key === 'length' ? MAX_SAFE_INTEGER : target[key];
  } });
  assert.throws(() => splice(source, -1, 1, 3, 4), TypeError, 'rejects overflow on an array proxy');
  assert.deepEqual(keys, ['length'], 'rejects overflow before reading the constructor');
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
  for (const args of [[], [0], [-0], [0, 0], [0, -0], [0, -0.5], [0, -1]]) {
    const array = [];
    let calls = 0;
    function Species(length) {
      calls++;
      assert.same(length, 0, 'species receives positive zero');
      return [];
    }
    array.constructor = { [Symbol.species]: Species };
    splice(array, ...args);
    assert.same(calls, 1, 'species is called once');
  }
});
