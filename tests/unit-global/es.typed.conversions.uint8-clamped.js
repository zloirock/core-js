import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from '../helpers/constants.js';

QUnit.test('Uint8Clamped conversions', assert => {
  const uint8clamped = new Uint8ClampedArray(1);
  const uint8array = new Uint8Array(uint8clamped.buffer);

  function toString(it) {
    return it === 0 && 1 / it === -Infinity ? '-0' : it;
  }

  const data = [
    [0, 0, [0]],
    [-0, 0, [0]],
    [1, 1, [1]],
    [-1, 0, [0]],
    [1.1, 1, [1]],
    [-1.1, 0, [0]],
    [1.9, 2, [2]],
    [-1.9, 0, [0]],
    // round-half-to-even (banker's rounding)
    [0.5, 0, [0]],
    [1.5, 2, [2]],
    [2.5, 2, [2]],
    [3.5, 4, [4]],
    [4.5, 4, [4]],
    [253.5, 254, [254]],
    [254.5, 254, [254]],
    [127, 127, [127]],
    [-127, 0, [0]],
    [128, 128, [128]],
    [-128, 0, [0]],
    [255, 255, [255]],
    [-255, 0, [0]],
    [255.1, 255, [255]],
    [255.9, 255, [255]],
    [256, 255, [255]],
    [32767, 255, [255]],
    [-32767, 0, [0]],
    [32768, 255, [255]],
    [-32768, 0, [0]],
    [65535, 255, [255]],
    [65536, 255, [255]],
    [65537, 255, [255]],
    [65536.54321, 255, [255]],
    [-65536.54321, 0, [0]],
    [2147483647, 255, [255]],
    [-2147483647, 0, [0]],
    [2147483648, 255, [255]],
    [-2147483648, 0, [0]],
    [2147483649, 255, [255]],
    [-2147483649, 0, [0]],
    [4294967295, 255, [255]],
    [4294967296, 255, [255]],
    [4294967297, 255, [255]],
    [MAX_SAFE_INTEGER, 255, [255]],
    [MIN_SAFE_INTEGER, 0, [0]],
    [MAX_SAFE_INTEGER + 1, 255, [255]],
    [MIN_SAFE_INTEGER - 1, 0, [0]],
    [MAX_SAFE_INTEGER + 3, 255, [255]],
    [MIN_SAFE_INTEGER - 3, 0, [0]],
    [Infinity, 255, [255]],
    [-Infinity, 0, [0]],
    [-Number.MAX_VALUE, 0, [0]],
    [Number.MAX_VALUE, 255, [255]],
    [Number.MIN_VALUE, 0, [0]],
    [-Number.MIN_VALUE, 0, [0]],
    [NaN, 0, [0]],
  ];
  for (const [value, conversion, little] of data) {
    uint8clamped[0] = value;
    assert.same(uint8clamped[0], conversion, `Uint8ClampedArray ${ toString(value) } -> ${ toString(conversion) }`);
    assert.arrayEqual(uint8array, little, `Uint8ClampedArray ${ toString(value) } -> [${ little }]`);
  }
});
