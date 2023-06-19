import { DESCRIPTORS } from '../helpers/constants';

QUnit.test('DataView.prototype.{ getUint8C, setUint8C }', assert => {
  const { getUint8C, setUint8C } = DataView.prototype;

  assert.isFunction(getUint8C);
  assert.arity(getUint8C, 1);
  assert.name(getUint8C, 'getUint8C');

  assert.isFunction(setUint8C);
  assert.arity(setUint8C, 2);
  assert.name(setUint8C, 'setUint8C');

  assert.same(new DataView(new ArrayBuffer(8)).setUint8C(0, 0), undefined, 'void');

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
    [9007199254740991, 255, [255]],
    [-9007199254740991, 0, [0]],
    [9007199254740992, 255, [255]],
    [-9007199254740992, 0, [0]],
    [9007199254740994, 255, [255]],
    [-9007199254740994, 0, [0]],
    [Infinity, 255, [255]],
    [-Infinity, 0, [0]],
    [-1.7976931348623157e+308, 0, [0]],
    [1.7976931348623157e+308, 255, [255]],
    [5e-324, 0, [0]],
    [-5e-324, 0, [0]],
    [NaN, 0, [0]],
  ];

  const buffer = new ArrayBuffer(1);
  const view = new DataView(buffer);
  const array = DESCRIPTORS ? new Uint8Array(buffer) : null;

  for (const [value, conversion, little] of data) {
    view.setUint8C(0, value);
    assert.same(view.getUint8C(0, value), conversion, `DataView.prototype.setUint8C + DataView.prototype.getUint8C, ${ toString(value) } -> ${ toString(conversion) }`);
    assert.same(view.getUint8(0, value), conversion, `DataView.prototype.setUint8C + DataView.prototype.getUint8, ${ toString(value) } -> ${ toString(conversion) }`);
    if (DESCRIPTORS) assert.arrayEqual(array, little, `DataView.prototype.setUint8C + Uint8Array ${ toString(value) } -> [${ little }]`);
  }
});
