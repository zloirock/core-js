import { STRICT } from '../helpers/constants';

import sort from 'core-js-pure/features/array/sort';

QUnit.test('Array#sort', assert => {
  assert.isFunction(sort);
  assert.notThrows(() => sort([1, 2, 3], undefined), 'works with undefined');
  assert.throws(() => sort([1, 2, 3], null), 'throws on null');
  assert.throws(() => sort([1, 2, 3], {}), 'throws on {}');

  const expected = Array(516);
  let array = Array(516);
  let index, mod, code, chr, value;

  for (index = 0; index < 516; index++) {
    mod = index % 4;
    array[index] = 515 - index;
    expected[index] = index - 2 * mod + 3;
  }

  sort(array, (a, b) => (a / 4 | 0) - (b / 4 | 0));

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

  if (STRICT) {
    assert.throws(() => sort(null), TypeError, 'ToObject(this)');
    assert.throws(() => sort(undefined), TypeError, 'ToObject(this)');
  }
});
