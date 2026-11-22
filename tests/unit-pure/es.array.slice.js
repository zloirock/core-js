import { DESCRIPTORS, GLOBAL, PROTO, STRICT } from '../helpers/constants.js';
import { createInheritingArray, createSpeciesShrinkingArray } from '../helpers/helpers.js';

import Symbol from 'core-js-pure/es/symbol';
import isArray from 'core-js-pure/es/array/is-array';
import slice from 'core-js-pure/es/array/slice';

QUnit.test('Array#slice', assert => {
  assert.isFunction(slice);
  let array = ['1', '2', '3', '4', '5'];
  assert.deepEqual(slice(array), array);
  assert.deepEqual(slice(array, 1, 3), ['2', '3']);
  assert.deepEqual(slice(array, 1, undefined), ['2', '3', '4', '5']);
  assert.deepEqual(slice(array, 1, -1), ['2', '3', '4']);
  assert.deepEqual(slice(array, -2, -1), ['4']);
  assert.deepEqual(slice(array, -2, -3), []);
  const string = '12345';
  assert.deepEqual(slice(string), array);
  assert.deepEqual(slice(string, 1, 3), ['2', '3']);
  assert.deepEqual(slice(string, 1, undefined), ['2', '3', '4', '5']);
  assert.deepEqual(slice(string, 1, -1), ['2', '3', '4']);
  assert.deepEqual(slice(string, -2, -1), ['4']);
  assert.deepEqual(slice(string, -2, -3), []);
  const list = GLOBAL.document && document.body && document.body.childNodes;
  if (list) {
    assert.returns(() => isArray(slice(list)), true, 'works with NodeList');
  }
  if (STRICT) {
    assert.throws(() => slice(null), TypeError);
    assert.throws(() => slice(undefined), TypeError);
  }
  array = [];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.same(slice(array).foo, 1, '@@species');
  array = [1, 2];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function (length) {
    return { foo: length };
  } };
  assert.same(slice(array).foo, 2, 'species receives the count');
});

QUnit.test('Array#slice snapshots the length before converting start and end', assert => {
  for (const atStart of [true, false]) {
    const array = [1, 2, 3];
    const bound = { valueOf() {
      array.length = 1;
      return atStart ? 0 : 3;
    } };
    const result = atStart ? slice(array, bound) : slice(array, 0, bound);
    assert.same(result.length, 3, atStart ? 'start' : 'end');
    assert.same(result[0], 1);
    assert.false(1 in result);
    assert.false(2 in result);
  }
});

if (DESCRIPTORS && PROTO) QUnit.test('Array#slice reads inherited elements after the source shrinks', assert => {
  let result = slice(createSpeciesShrinkingArray());
  assert.same(result.length, 3);
  assert.same(result[0], 1);
  assert.false(1 in result);
  assert.same(result[2], 'inherited');
  const array = createInheritingArray();
  result = slice(array, { valueOf() {
    array.length = 1;
    return 0;
  } });
  assert.same(result.length, 3, 'shrinks while converting the start');
  assert.same(result[0], 1);
  assert.false(1 in result);
  assert.same(result[2], 'inherited');
});

QUnit.test('Array#slice reads indices from 2 ** 32 - 1 up', assert => {
  const arrayLike = { length: 2 ** 32 + 2, [2 ** 32 - 1]: 'a', [2 ** 32]: 'b' };
  const result = slice(arrayLike, 2 ** 32 - 1);
  assert.same(result.length, 3);
  assert.same(result[0], 'a');
  assert.same(result[1], 'b');
  assert.false(2 in result);
});

QUnit.test('Array#slice, zero-length species', assert => {
  function check(array, args) {
    let calls = 0;
    function Species(length) {
      calls++;
      assert.same(length, 0, 'species receives positive zero');
      return {};
    }
    array.constructor = { [Symbol.species]: Species };
    assert.same(slice(array, ...args).length, 0, 'the result gets positive zero length');
    assert.same(calls, 1, 'species is called once');
  }
  for (const args of [[0, 0], [0, -0], [0, -0.5], [0, '-0'], [undefined, -0], [-0, -0], [1, 0]]) check([], args);
  // V8 6.4 - 8.1 keep -0 only while elements follow the start, V8 5.1 - 6.3 skip the `length` for an end before it
  for (const args of [[0, -0], [0, -0.5], [0, '-0'], [undefined, -0], [1, -0], [1, 0], [2, 1], [1, 1]]) check([1, 2], args);
});
