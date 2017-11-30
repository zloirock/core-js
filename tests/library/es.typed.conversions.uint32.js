import { DESCRIPTORS, LITTLE_ENDIAN } from '../helpers/constants';

if (DESCRIPTORS) QUnit.test('Uint32 conversions', assert => {
  const { Uint32Array, Uint8Array, DataView } = core;

  const uint32array = new Uint32Array(1);
  const uint8array = new Uint8Array(uint32array.buffer);
  const dataview = new DataView(uint32array.buffer);

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
    [-1, 4294967295, [255, 255, 255, 255]],
    [1.1, 1, [1, 0, 0, 0]],
    [-1.1, 4294967295, [255, 255, 255, 255]],
    [1.9, 1, [1, 0, 0, 0]],
    [-1.9, 4294967295, [255, 255, 255, 255]],
    [127, 127, [127, 0, 0, 0]],
    [-127, 4294967169, [129, 255, 255, 255]],
    [128, 128, [128, 0, 0, 0]],
    [-128, 4294967168, [128, 255, 255, 255]],
    [255, 255, [255, 0, 0, 0]],
    [-255, 4294967041, [1, 255, 255, 255]],
    [255.1, 255, [255, 0, 0, 0]],
    [255.9, 255, [255, 0, 0, 0]],
    [256, 256, [0, 1, 0, 0]],
    [32767, 32767, [255, 127, 0, 0]],
    [-32767, 4294934529, [1, 128, 255, 255]],
    [32768, 32768, [0, 128, 0, 0]],
    [-32768, 4294934528, [0, 128, 255, 255]],
    [65535, 65535, [255, 255, 0, 0]],
    [65536, 65536, [0, 0, 1, 0]],
    [65537, 65537, [1, 0, 1, 0]],
    [65536.54321, 65536, [0, 0, 1, 0]],
    [-65536.54321, 4294901760, [0, 0, 255, 255]],
    [2147483647, 2147483647, [255, 255, 255, 127]],
    [-2147483647, 2147483649, [1, 0, 0, 128]],
    [2147483648, 2147483648, [0, 0, 0, 128]],
    [-2147483648, 2147483648, [0, 0, 0, 128]],
    [2147483649, 2147483649, [1, 0, 0, 128]],
    [-2147483649, 2147483647, [255, 255, 255, 127]],
    [4294967295, 4294967295, [255, 255, 255, 255]],
    [4294967296, 0, [0, 0, 0, 0]],
    [4294967297, 1, [1, 0, 0, 0]],
    [9007199254740991, 4294967295, [255, 255, 255, 255]],
    [-9007199254740991, 1, [1, 0, 0, 0]],
    [9007199254740992, 0, [0, 0, 0, 0]],
    [-9007199254740992, 0, [0, 0, 0, 0]],
    [9007199254740994, 2, [2, 0, 0, 0]],
    [-9007199254740994, 4294967294, [254, 255, 255, 255]],
    [Infinity, 0, [0, 0, 0, 0]], [-Infinity, 0, [0, 0, 0, 0]],
    [-1.7976931348623157e+308, 0, [0, 0, 0, 0]],
    [1.7976931348623157e+308, 0, [0, 0, 0, 0]],
    [5e-324, 0, [0, 0, 0, 0]],
    [-5e-324, 0, [0, 0, 0, 0]],
    [NaN, 0, [0, 0, 0, 0]],
  ];
  for (const [value, conversion, little] of data) {
    const big = little.slice().reverse();
    const representation = LITTLE_ENDIAN ? little : big;
    uint32array[0] = value;
    assert.same(uint32array[0], conversion, `Uint32Array ${ toString(value) } -> ${ toString(conversion) }`);
    assert.arrayEqual(uint8array, representation, `Uint32Array ${ toString(value) } -> [${ representation }]`);
    dataview.setUint32(0, value);
    assert.arrayEqual(uint8array, big, `dataview.setUint32(0, ${ toString(value) }) -> [${ big }]`);
    assert.same(viewFrom(big).getUint32(0), conversion, `dataview{${ big }}.getUint32(0) -> ${ toString(conversion) }`);
    dataview.setUint32(0, value, false);
    assert.arrayEqual(uint8array, big, `dataview.setUint32(0, ${ toString(value) }, false) -> [${ big }]`);
    assert.same(viewFrom(big).getUint32(0, false), conversion, `dataview{${ big }}.getUint32(0, false) -> ${ toString(conversion) }`);
    dataview.setUint32(0, value, true);
    assert.arrayEqual(uint8array, little, `dataview.setUint32(0, ${ toString(value) }, true) -> [${ little }]`);
    assert.same(viewFrom(little).getUint32(0, true), conversion, `dataview{${ little }}.getUint32(0, true) -> ${ toString(conversion) }`);
  }
});
