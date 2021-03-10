import { STRICT } from '../helpers/constants';

import sort from 'core-js-pure/full/array/sort';

QUnit.test('Array#sort', assert => {
  assert.isFunction(sort);
  assert.notThrows(() => sort([1, 2, 3], undefined), 'works with undefined');
  assert.throws(() => sort([1, 2, 3], null), 'throws on null');
  assert.throws(() => sort([1, 2, 3], {}), 'throws on {}');

  assert.deepEqual(sort([1, 3, 2]), [1, 2, 3], '#1');
  assert.deepEqual(sort([1, 3, 2, 11]), [1, 11, 2, 3], '#2');
  assert.deepEqual(sort([1, -1, 3, NaN, 2, 0, 11, -0]), [-1, 0, -0, 1, 11, 2, 3, NaN], '#3');

  let array = Array(5);
  array[0] = 1;
  array[2] = 3;
  array[4] = 2;
  let expected = Array(5);
  expected[0] = 1;
  expected[1] = 2;
  expected[2] = 3;
  assert.deepEqual(sort(array), expected, 'holes');

  array = 'zyxwvutsrqponMLKJIHGFEDCBA'.split('');
  expected = 'ABCDEFGHIJKLMnopqrstuvwxyz'.split('');
  assert.deepEqual(sort(array), expected, 'alpha #1');

  array = 'ёяюэьыъщшчцхфутсрПОНМЛКЙИЗЖЕДГВБА'.split('');
  expected = 'АБВГДЕЖЗИЙКЛМНОПрстуфхцчшщъыьэюяё'.split('');
  assert.deepEqual(sort(array), expected, 'alpha #2');

  array = [undefined, 1];
  assert.notThrows(() => sort(array, () => { throw 1; }), 'undefined #1');
  assert.deepEqual(array, [1, undefined], 'undefined #2');

  const object = {
    valueOf: () => 1,
    toString: () => -1,
  };

  array = {
    0: undefined,
    1: 2,
    2: 1,
    3: 'X',
    4: -1,
    5: 'a',
    6: true,
    7: object,
    8: NaN,
    10: Infinity,
    length: 11,
  };

  expected = {
    0: -1,
    1: object,
    2: 1,
    3: 2,
    4: Infinity,
    5: NaN,
    6: 'X',
    7: 'a',
    8: true,
    9: undefined,
    length: 11,
  };

  assert.deepEqual(sort(array), expected, 'custom generic');

  let index, mod, code, chr, value;
  expected = Array(516);
  array = Array(516);

  for (index = 0; index < 516; index++) {
    mod = index % 4;
    array[index] = 515 - index;
    expected[index] = index - 2 * mod + 3;
  }

  sort(array, (a, b) => (a / 4 | 0) - (b / 4 | 0));

  assert.ok(1 / sort([0, -0])[0] > 0, '-0');

  assert.same(String(array), String(expected), 'stable #1');

  let result = '';
  array = [];

  // generate an array with more 512 elements (Chakra and old V8 fails only in this case)
  for (code = 65; code < 76; code++) {
    chr = String.fromCharCode(code);

    switch (code) {
      case 66: case 69: case 70: case 72: value = 3; break;
      case 68: case 71: value = 4; break;
      default: value = 2;
    }

    for (index = 0; index < 47; index++) {
      array.push({ k: chr + index, v: value });
    }
  }

  sort(array, (a, b) => b.v - a.v);

  for (index = 0; index < array.length; index++) {
    chr = array[index].k.charAt(0);
    if (result.charAt(result.length - 1) !== chr) result += chr;
  }

  assert.same(result, 'DGBEFHACIJK', 'stable #2');

  /* eslint-disable es/no-symbol -- safe */
  if (typeof Symbol === 'function') {
    assert.throws(() => sort([Symbol(1), Symbol(2)]), 'w/o cmp throws on symbols');
  }

  if (STRICT) {
    assert.throws(() => sort(null), TypeError, 'ToObject(this)');
    assert.throws(() => sort(undefined), TypeError, 'ToObject(this)');
  }
});
