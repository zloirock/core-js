QUnit.test('Array#sort', assert => {
  const { sort } = Array.prototype;
  assert.isFunction(sort);
  assert.arity(sort, 1);
  assert.name(sort, 'sort');
  assert.looksNative(sort);
  assert.nonEnumerable(Array.prototype, 'sort');

  assert.deepEqual([1, 3, 2].sort(), [1, 2, 3], '#1');
  assert.deepEqual([1, 3, 2, 11].sort(), [1, 11, 2, 3], '#2');
  assert.deepEqual([1, -1, 3, NaN, 2, 0, 11, -0].sort(), [-1, 0, -0, 1, 11, 2, 3, NaN], '#1');

  let array = Array(5);
  array[0] = 1;
  array[2] = 3;
  array[4] = 2;
  let expected = Array(5);
  expected[0] = 1;
  expected[1] = 2;
  expected[2] = 3;
  assert.deepEqual(array.sort(), expected, 'holes');

  array = 'zyxwvutsrqponMLKJIHGFEDCBA'.split('');
  expected = 'ABCDEFGHIJKLMnopqrstuvwxyz'.split('');
  assert.deepEqual(array.sort(), expected, 'alpha #1');

  array = 'ёяюэьыъщшчцхфутсрПОНМЛКЙИЗЖЕДГВБА'.split('');
  expected = 'АБВГДЕЖЗИЙКЛМНОПрстуфхцчшщъыьэюяё'.split('');
  assert.deepEqual(array.sort(), expected, 'alpha #2');

  array = [undefined, 1];
  assert.notThrows(() => array.sort(() => { throw 1; }), 'undefined #1');
  assert.deepEqual(array, [1, undefined], 'undefined #2');

  /* Safari TP ~ 17.6 issue
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

  assert.deepEqual(sort.call(array), expected, 'custom generic');
  */

  let index, mod, code, chr, value;
  expected = Array(516);
  array = Array(516);

  for (index = 0; index < 516; index++) {
    mod = index % 4;
    array[index] = 515 - index;
    expected[index] = index - 2 * mod + 3;
  }

  array.sort((a, b) => (a / 4 | 0) - (b / 4 | 0));

  assert.true(1 / [0, -0].sort()[0] > 0, '-0');

  assert.arrayEqual(array, expected, 'stable #1');

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

  array.sort((a, b) => b.v - a.v);

  for (index = 0; index < array.length; index++) {
    chr = array[index].k.charAt(0);
    if (result.charAt(result.length - 1) !== chr) result += chr;
  }

  assert.same(result, 'DGBEFHACIJK', 'stable #2');

  assert.notThrows(() => [1, 2, 3].sort(undefined).length === 3, 'works with undefined');
  assert.throws(() => [1, 2, 3].sort(null), 'throws on null');
  assert.throws(() => [1, 2, 3].sort({}), 'throws on {}');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => [Symbol(1), Symbol(2)].sort(), 'w/o cmp throws on symbols');
  }

  assert.throws(() => sort.call(null), TypeError, 'ToObject(this)');
  assert.throws(() => sort.call(undefined), TypeError, 'ToObject(this)');
});
