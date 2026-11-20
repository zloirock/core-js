import { DESCRIPTORS, GLOBAL, PROTO, STRICT } from '../helpers/constants.js';
import { createSpeciesShrinkingArray } from '../helpers/helpers.js';

QUnit.test('Array#slice', assert => {
  const { slice } = Array.prototype;
  const { isArray } = Array;
  assert.isFunction(slice);
  assert.arity(slice, 2);
  assert.name(slice, 'slice');
  assert.looksNative(slice);
  assert.nonEnumerable(Array.prototype, 'slice');
  let array = ['1', '2', '3', '4', '5'];
  assert.deepEqual(array.slice(), array);
  assert.deepEqual(array.slice(1, 3), ['2', '3']);
  assert.deepEqual(array.slice(1, undefined), ['2', '3', '4', '5']);
  assert.deepEqual(array.slice(1, -1), ['2', '3', '4']);
  assert.deepEqual(array.slice(-2, -1), ['4']);
  assert.deepEqual(array.slice(-2, -3), []);
  const string = '12345';
  assert.deepEqual(slice.call(string), array);
  assert.deepEqual(slice.call(string, 1, 3), ['2', '3']);
  assert.deepEqual(slice.call(string, 1, undefined), ['2', '3', '4', '5']);
  assert.deepEqual(slice.call(string, 1, -1), ['2', '3', '4']);
  assert.deepEqual(slice.call(string, -2, -1), ['4']);
  assert.deepEqual(slice.call(string, -2, -3), []);
  const list = GLOBAL.document && document.body && document.body.childNodes;
  if (list) {
    assert.returns(() => isArray(slice.call(list)), true, 'works on NodeList');
  }
  if (STRICT) {
    assert.throws(() => slice.call(null), TypeError);
    assert.throws(() => slice.call(undefined), TypeError);
  }
  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- @@species
  assert.same(array.slice().foo, 1, '@@species');
  const descriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor(Array, Symbol.species);
  if (descriptor && descriptor.configurable) {
    Object.defineProperty(Array, Symbol.species, { configurable: true, get: () => function () {
      return { foo: 1 };
    } });
    try {
      // eslint-disable-next-line es/no-nonstandard-array-prototype-properties -- @@species
      assert.same([1].slice().foo, 1, '@@species of `Array` of the current realm');
    } finally {
      Object.defineProperty(Array, Symbol.species, descriptor);
    }
  }
});

QUnit.test('Array#slice snapshots the length before converting start and end', assert => {
  for (const atStart of [true, false]) {
    const array = [1, 2, 3];
    const bound = { valueOf() {
      array.length = 1;
      return atStart ? 0 : 3;
    } };
    const result = atStart ? array.slice(bound) : array.slice(0, bound);
    assert.same(result.length, 3, atStart ? 'start' : 'end');
    assert.same(result[0], 1);
    assert.false(1 in result);
    assert.false(2 in result);
  }
});

if (DESCRIPTORS && PROTO) QUnit.test('Array#slice reads inherited elements after the source shrinks', assert => {
  const result = createSpeciesShrinkingArray().slice();
  assert.same(result.length, 3);
  assert.same(result[0], 1);
  assert.false(1 in result);
  assert.same(result[2], 'inherited');
});
