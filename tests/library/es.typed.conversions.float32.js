import { DESCRIPTORS, LITTLE_ENDIAN } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('Float32 conversions', assert => {
  const { Float32Array, Uint8Array, DataView } = core;

  const float32array = new Float32Array(1);
  const uint8array = new Uint8Array(float32array.buffer);
  const dataview = new DataView(float32array.buffer);

  function viewFrom(it) {
    return new DataView(new Uint8Array(it).buffer);
  }
  function toString(it) {
    return it === 0 && 1 / it === -Infinity ? '-0' : it;
  }

  const data = [
    [0, 0, [0, 0, 0, 0]],
    [-0, -0, [0, 0, 0, 128]],
    [1, 1, [0, 0, 128, 63]],
    [-1, -1, [0, 0, 128, 191]],
    [1.1, 1.100000023841858, [205, 204, 140, 63]],
    [-1.1, -1.100000023841858, [205, 204, 140, 191]],
    [1.9, 1.899999976158142, [51, 51, 243, 63]],
    [-1.9, -1.899999976158142, [51, 51, 243, 191]],
    [127, 127, [0, 0, 254, 66]],
    [-127, -127, [0, 0, 254, 194]],
    [128, 128, [0, 0, 0, 67]],
    [-128, -128, [0, 0, 0, 195]],
    [255, 255, [0, 0, 127, 67]],
    [-255, -255, [0, 0, 127, 195]],
    [255.1, 255.10000610351562, [154, 25, 127, 67]],
    [255.9, 255.89999389648438, [102, 230, 127, 67]],
    [256, 256, [0, 0, 128, 67]],
    [32767, 32767, [0, 254, 255, 70]],
    [-32767, -32767, [0, 254, 255, 198]],
    [32768, 32768, [0, 0, 0, 71]],
    [-32768, -32768, [0, 0, 0, 199]],
    [65535, 65535, [0, 255, 127, 71]],
    [65536, 65536, [0, 0, 128, 71]],
    [65537, 65537, [128, 0, 128, 71]],
    [65536.54321, 65536.546875, [70, 0, 128, 71]],
    [-65536.54321, -65536.546875, [70, 0, 128, 199]],
    [2147483647, 2147483648, [0, 0, 0, 79]],
    [-2147483647, -2147483648, [0, 0, 0, 207]],
    [2147483648, 2147483648, [0, 0, 0, 79]],
    [-2147483648, -2147483648, [0, 0, 0, 207]],
    [2147483649, 2147483648, [0, 0, 0, 79]],
    [-2147483649, -2147483648, [0, 0, 0, 207]],
    [4294967295, 4294967296, [0, 0, 128, 79]],
    [4294967296, 4294967296, [0, 0, 128, 79]],
    [4294967297, 4294967296, [0, 0, 128, 79]],
    [9007199254740991, 9007199254740992, [0, 0, 0, 90]],
    [-9007199254740991, -9007199254740992, [0, 0, 0, 218]],
    [9007199254740992, 9007199254740992, [0, 0, 0, 90]],
    [-9007199254740992, -9007199254740992, [0, 0, 0, 218]],
    [9007199254740994, 9007199254740992, [0, 0, 0, 90]],
    [-9007199254740994, -9007199254740992, [0, 0, 0, 218]],
    [Infinity, Infinity, [0, 0, 128, 127]],
    [-Infinity, -Infinity, [0, 0, 128, 255]],
    [1.7976931348623157e+308, Infinity, [0, 0, 128, 127]],
    [-1.7976931348623157e+308, -Infinity, [0, 0, 128, 255]],
    [5e-324, 0, [0, 0, 0, 0]],
    [-5e-324, -0, [0, 0, 0, 128]]
  ];
  for (const [value, conversion, little] of data) {
    const big = little.slice().reverse();
    const representation = LITTLE_ENDIAN ? little : big;
    float32array[0] = value;
    assert.same(float32array[0], conversion, `Float32Array ${ toString(value) } -> ${ toString(conversion) }`);
    assert.arrayEqual(uint8array, representation, `Float32Array ${ toString(value) } -> [${ representation }]`);
    dataview.setFloat32(0, value);
    assert.arrayEqual(uint8array, big, `dataview.setFloat32(0, ${ toString(value) }) -> [${ big }]`);
    assert.same(viewFrom(big).getFloat32(0), conversion, `dataview{${ big }}.getFloat32(0) -> ${ toString(conversion) }`);
    dataview.setFloat32(0, value, false);
    assert.arrayEqual(uint8array, big, `dataview.setFloat32(0, ${ toString(value) }, false) -> [${ big }]`);
    assert.same(viewFrom(big).getFloat32(0, false), conversion, `dataview{${ big }}.getFloat32(0, false) -> ${ toString(conversion) }`);
    dataview.setFloat32(0, value, true);
    assert.arrayEqual(uint8array, little, `dataview.setFloat32(0, ${ toString(value) }, true) -> [${ little }]`);
    assert.same(viewFrom(little).getFloat32(0, true), conversion, `dataview{${ little }}.getFloat32(0, true) -> ${ toString(conversion) }`);
  }
  float32array[0] = NaN;
  assert.same(float32array[0], NaN, 'NaN -> NaN');
});
