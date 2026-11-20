import { DESCRIPTORS, GLOBAL, PROTO, STRICT } from '../helpers/constants.js';
import { createSpeciesShrinkingArray } from '../helpers/helpers.js';

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
  const result = slice(createSpeciesShrinkingArray());
  assert.same(result.length, 3);
  assert.same(result[0], 1);
  assert.false(1 in result);
  assert.same(result[2], 'inherited');
});
