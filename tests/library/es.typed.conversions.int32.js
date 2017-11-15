import { DESCRIPTORS, LITTLE_ENDIAN } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('Int32 conversions', assert => {
  const { Int32Array, Uint8Array, DataView } = core;

  const int32array = new Int32Array(1);
  const uint8array = new Uint8Array(int32array.buffer);
  const dataview = new DataView(int32array.buffer);

  function viewFrom(it) {
    return new DataView(new Uint8Array(it).buffer);
  }
  function toString(it) {
    return it === 0 && 1 / it === -Infinity ? '-0' : it;
  }

  const data = [
    [0, 0, [0, 0, 0, 0]],
    [-0, 0, [0, 0, 0, 0]],
    [1, 1, [1, 0, 0, 0]],
    [-1, -1, [255, 255, 255, 255]],
    [1.1, 1, [1, 0, 0, 0]],
    [-1.1, -1, [255, 255, 255, 255]],
    [1.9, 1, [1, 0, 0, 0]],
    [-1.9, -1, [255, 255, 255, 255]],
    [127, 127, [127, 0, 0, 0]],
    [-127, -127, [129, 255, 255, 255]],
    [128, 128, [128, 0, 0, 0]],
    [-128, -128, [128, 255, 255, 255]],
    [255, 255, [255, 0, 0, 0]],
    [-255, -255, [1, 255, 255, 255]],
    [255.1, 255, [255, 0, 0, 0]],
    [255.9, 255, [255, 0, 0, 0]],
    [256, 256, [0, 1, 0, 0]],
    [32767, 32767, [255, 127, 0, 0]],
    [-32767, -32767, [1, 128, 255, 255]],
    [32768, 32768, [0, 128, 0, 0]],
    [-32768, -32768, [0, 128, 255, 255]],
    [65535, 65535, [255, 255, 0, 0]],
    [65536, 65536, [0, 0, 1, 0]],
    [65537, 65537, [1, 0, 1, 0]],
    [65536.54321, 65536, [0, 0, 1, 0]],
    [-65536.54321, -65536, [0, 0, 255, 255]],
    [2147483647, 2147483647, [255, 255, 255, 127]],
    [-2147483647, -2147483647, [1, 0, 0, 128]],
    [2147483648, -2147483648, [0, 0, 0, 128]],
    [-2147483648, -2147483648, [0, 0, 0, 128]],
    [2147483649, -2147483647, [1, 0, 0, 128]],
    [-2147483649, 2147483647, [255, 255, 255, 127]],
    [4294967295, -1, [255, 255, 255, 255]],
    [4294967296, 0, [0, 0, 0, 0]],
    [4294967297, 1, [1, 0, 0, 0]],
    [9007199254740991, -1, [255, 255, 255, 255]],
    [-9007199254740991, 1, [1, 0, 0, 0]],
    [9007199254740992, 0, [0, 0, 0, 0]],
    [-9007199254740992, 0, [0, 0, 0, 0]],
    [9007199254740994, 2, [2, 0, 0, 0]],
    [-9007199254740994, -2, [254, 255, 255, 255]],
    [Infinity, 0, [0, 0, 0, 0]],
    [-Infinity, 0, [0, 0, 0, 0]],
    [-1.7976931348623157e+308, 0, [0, 0, 0, 0]],
    [1.7976931348623157e+308, 0, [0, 0, 0, 0]],
    [5e-324, 0, [0, 0, 0, 0]],
    [-5e-324, 0, [0, 0, 0, 0]],
    [NaN, 0, [0, 0, 0, 0]]
  ];
  for (const [value, conversion, little] of data) {
    const big = little.slice().reverse();
    const representation = LITTLE_ENDIAN ? little : big;
    int32array[0] = value;
    assert.same(int32array[0], conversion, `Int32Array ${ toString(value) } -> ${ toString(conversion) }`);
    assert.arrayEqual(uint8array, representation, `Int32Array ${ toString(value) } -> [${ representation }]`);
    dataview.setInt32(0, value);
    assert.arrayEqual(uint8array, big, `dataview.setInt32(0, ${ toString(value) }) -> [${ big }]`);
    assert.same(viewFrom(big).getInt32(0), conversion, `dataview{${ big }}.getInt32(0) -> ${ toString(conversion) }`);
    dataview.setInt32(0, value, false);
    assert.arrayEqual(uint8array, big, `dataview.setInt32(0, ${ toString(value) }, false) -> [${ big }]`);
    assert.same(viewFrom(big).getInt32(0, false), conversion, `dataview{${ big }}.getInt32(0, false) -> ${ toString(conversion) }`);
    dataview.setInt32(0, value, true);
    assert.arrayEqual(uint8array, little, `dataview.setInt32(0, ${ toString(value) }, true) -> [${ little }]`);
    assert.same(viewFrom(little).getInt32(0, true), conversion, `dataview{${ little }}.getInt32(0, true) -> ${ toString(conversion) }`);
  }
});
