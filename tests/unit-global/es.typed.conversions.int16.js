import { LITTLE_ENDIAN, MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from '../helpers/constants.js';

QUnit.test('Int16 conversions', assert => {
  const int16array = new Int16Array(1);
  const uint8array = new Uint8Array(int16array.buffer);
  const dataview = new DataView(int16array.buffer);

  function viewFrom(it) {
    return new DataView(new Uint8Array(it).buffer);
  }
  function toString(it) {
    return it === 0 && 1 / it === -Infinity ? '-0' : it;
  }

  const data = [
    [0, 0, [0, 0]],
    [-0, 0, [0, 0]],
    [1, 1, [1, 0]],
    [-1, -1, [255, 255]],
    [1.1, 1, [1, 0]],
    [-1.1, -1, [255, 255]],
    [1.9, 1, [1, 0]],
    [-1.9, -1, [255, 255]],
    [127, 127, [127, 0]],
    [-127, -127, [129, 255]],
    [128, 128, [128, 0]],
    [-128, -128, [128, 255]],
    [255, 255, [255, 0]],
    [-255, -255, [1, 255]],
    [255.1, 255, [255, 0]],
    [255.9, 255, [255, 0]],
    [256, 256, [0, 1]],
    [32767, 32767, [255, 127]],
    [-32767, -32767, [1, 128]],
    [32768, -32768, [0, 128]],
    [-32768, -32768, [0, 128]],
    [65535, -1, [255, 255]],
    [65536, 0, [0, 0]],
    [65537, 1, [1, 0]],
    [65536.54321, 0, [0, 0]],
    [-65536.54321, 0, [0, 0]],
    [2147483647, -1, [255, 255]],
    [-2147483647, 1, [1, 0]],
    [2147483648, 0, [0, 0]],
    [-2147483648, 0, [0, 0]],
    [4294967296, 0, [0, 0]],
    [MAX_SAFE_INTEGER + 1, 0, [0, 0]],
    [MIN_SAFE_INTEGER - 1, 0, [0, 0]],
    [Infinity, 0, [0, 0]],
    [-Infinity, 0, [0, 0]],
    [-Number.MAX_VALUE, 0, [0, 0]],
    [Number.MAX_VALUE, 0, [0, 0]],
    [Number.MIN_VALUE, 0, [0, 0]],
    [-Number.MIN_VALUE, 0, [0, 0]],
    [NaN, 0, [0, 0]],
    [2147483649, 1, [1, 0]],
    [-2147483649, -1, [255, 255]],
    [4294967295, -1, [255, 255]],
    [4294967297, 1, [1, 0]],
    [MAX_SAFE_INTEGER, -1, [255, 255]],
    [MIN_SAFE_INTEGER, 1, [1, 0]],
    [MAX_SAFE_INTEGER + 3, 2, [2, 0]],
    [MIN_SAFE_INTEGER - 3, -2, [254, 255]],
  ];

  for (const [value, conversion, little] of data) {
    const big = little.slice().reverse();
    const representation = LITTLE_ENDIAN ? little : big;
    int16array[0] = value;
    assert.same(int16array[0], conversion, `Int16Array ${ toString(value) } -> ${ toString(conversion) }`);
    assert.arrayEqual(uint8array, representation, `Int16Array ${ toString(value) } -> [${ representation }]`);
    dataview.setInt16(0, value);
    assert.arrayEqual(uint8array, big, `dataview.setInt16(0, ${ toString(value) }) -> [${ big }]`);
    assert.same(viewFrom(big).getInt16(0), conversion, `dataview{${ big }}.getInt16(0) -> ${ toString(conversion) }`);
    dataview.setInt16(0, value, false);
    assert.arrayEqual(uint8array, big, `dataview.setInt16(0, ${ toString(value) }, false) -> [${ big }]`);
    assert.same(viewFrom(big).getInt16(0, false), conversion, `dataview{${ big }}.getInt16(0, false) -> ${ toString(conversion) }`);
    dataview.setInt16(0, value, true);
    assert.arrayEqual(uint8array, little, `dataview.setInt16(0, ${ toString(value) }, true) -> [${ little }]`);
    assert.same(viewFrom(little).getInt16(0, true), conversion, `dataview{${ little }}.getInt16(0, true) -> ${ toString(conversion) }`);
  }
});
