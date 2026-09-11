import { MAX_SAFE_INTEGER, MIN_SAFE_INTEGER } from '../helpers/constants.js';

QUnit.test('DataView.prototype.{ getUint8Clamped, setUint8Clamped }', assert => {
  const { getUint8Clamped, setUint8Clamped } = DataView.prototype;

  assert.isFunction(getUint8Clamped);
  assert.arity(getUint8Clamped, 1);
  assert.name(getUint8Clamped, 'getUint8Clamped');

  assert.isFunction(setUint8Clamped);
  assert.arity(setUint8Clamped, 2);
  assert.name(setUint8Clamped, 'setUint8Clamped');

  assert.same(new DataView(new ArrayBuffer(8)).setUint8Clamped(0, 0), undefined, 'void');

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

  const buffer = new ArrayBuffer(1);
  const view = new DataView(buffer);
  const array = new Uint8Array(buffer);

  for (const [value, conversion, little] of data) {
    view.setUint8Clamped(0, value);
    assert.same(view.getUint8Clamped(0), conversion, `DataView.prototype.setUint8Clamped + DataView.prototype.getUint8Clamped, ${ toString(value) } -> ${ toString(conversion) }`);
    assert.same(view.getUint8(0), conversion, `DataView.prototype.setUint8Clamped + DataView.prototype.getUint8, ${ toString(value) } -> ${ toString(conversion) }`);
    assert.arrayEqual(array, little, `DataView.prototype.setUint8Clamped + Uint8Array ${ toString(value) } -> [${ little }]`);
  }
});
