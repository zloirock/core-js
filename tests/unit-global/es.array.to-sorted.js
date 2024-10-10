QUnit.test('Array#toSorted', assert => {
  const { toSorted } = Array.prototype;

  assert.isFunction(toSorted);
  assert.arity(toSorted, 1);
  assert.name(toSorted, 'toSorted');
  assert.looksNative(toSorted);
  assert.nonEnumerable(Array.prototype, 'toSorted');

  let array = [1];
  assert.notSame(array.toSorted(), array, 'immutable');

  assert.deepEqual([1, 3, 2].toSorted(), [1, 2, 3], '#1');
  assert.deepEqual([1, 3, 2, 11].toSorted(), [1, 11, 2, 3], '#2');
  assert.deepEqual([1, -1, 3, NaN, 2, 0, 11, -0].toSorted(), [-1, 0, -0, 1, 11, 2, 3, NaN], '#1');

  array = Array(5);
  array[0] = 1;
  array[2] = 3;
  array[4] = 2;
  let expected = Array(5);
  expected[0] = 1;
  expected[1] = 2;
  expected[2] = 3;
  assert.deepEqual(array.toSorted(), expected, 'holes');

  array = 'zyxwvutsrqponMLKJIHGFEDCBA'.split('');
  expected = 'ABCDEFGHIJKLMnopqrstuvwxyz'.split('');
  assert.deepEqual(array.toSorted(), expected, 'alpha #1');

  array = 'ёяюэьыъщшчцхфутсрПОНМЛКЙИЗЖЕДГВБА'.split('');
  expected = 'АБВГДЕЖЗИЙКЛМНОПрстуфхцчшщъыьэюяё'.split('');
  assert.deepEqual(array.toSorted(), expected, 'alpha #2');

  array = [undefined, 1];
  assert.notThrows(() => array = array.toSorted(() => { throw 1; }), 'undefined #1');
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

  expected = [
    -1,
    object,
    1,
    2,
    Infinity,
    NaN,
    'X',
    'a',
    true,
    undefined,
    undefined,
  ];

  assert.deepEqual(toSorted.call(array), expected, 'non-array target');
  */

  let index, mod, code, chr, value;
  expected = Array(516);
  array = Array(516);

  for (index = 0; index < 516; index++) {
    mod = index % 4;
    array[index] = 515 - index;
    expected[index] = index - 2 * mod + 3;
  }

  assert.arrayEqual(array.toSorted((a, b) => (a / 4 | 0) - (b / 4 | 0)), expected, 'stable #1');

  assert.true(1 / [0, -0].toSorted()[0] > 0, '-0');

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

  array = array.toSorted((a, b) => b.v - a.v);

  for (index = 0; index < array.length; index++) {
    chr = array[index].k.charAt(0);
    if (result.charAt(result.length - 1) !== chr) result += chr;
  }

  assert.same(result, 'DGBEFHACIJK', 'stable #2');

  assert.notThrows(() => [1, 2, 3].toSorted(undefined).length === 3, 'works with undefined');
  assert.throws(() => [1, 2, 3].toSorted(null), 'throws on null');
  assert.throws(() => [1, 2, 3].toSorted({}), 'throws on {}');

  if (typeof Symbol == 'function' && !Symbol.sham) {
    assert.throws(() => [Symbol(1), Symbol(2)].toSorted(), 'w/o cmp throws on symbols');
  }

  array = [1];
  // eslint-disable-next-line object-shorthand -- constructor
  array.constructor = { [Symbol.species]: function () {
    return { foo: 1 };
  } };
  assert.true(array.toSorted() instanceof Array, 'non-generic');

  assert.throws(() => toSorted.call(null), TypeError, 'ToObject(this)');
  assert.throws(() => toSorted.call(undefined), TypeError, 'ToObject(this)');

  assert.true('toSorted' in Array.prototype[Symbol.unscopables], 'In Array#@@unscopables');
});
