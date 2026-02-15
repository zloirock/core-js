QUnit.test('DataView.prototype.{ getFloat16, setFloat16 }', assert => {
  const { getFloat16, setFloat16 } = DataView.prototype;

  assert.isFunction(getFloat16);
  assert.arity(getFloat16, 1);
  assert.name(getFloat16, 'getFloat16');

  assert.isFunction(setFloat16);
  assert.arity(setFloat16, 2);
  assert.name(setFloat16, 'setFloat16');

  assert.same(new DataView(new ArrayBuffer(8)).setFloat16(0, 0), undefined, 'void');

  function toString(it) {
    return it === 0 && 1 / it === -Infinity ? '-0' : it;
  }

  const data = [
    [0b0000000000000000, 0],
    [0b1000000000000000, -0],
    [0b0011110000000000, 1],
    [0b1011110000000000, -1],
    [0b0100001001001000, 3.140625],
    [0b0000001000000000, 0.000030517578125],
    [0b0111101111111111, 65504],
    [0b1111101111111111, -65504],
    [0b0000000000000001, 2 ** -24],
    [0b1000000000000001, -(2 ** -24)],
    // [0b0111110000000001, NaN], <- what NaN representation should be used?
    [0b0111110000000000, Infinity],
    [0b1111110000000000, -Infinity],
    // normal values in (0, 1) — regression test for floor vs truncation of log2
    [0b0011100000000000, 0.5],
    [0b0011101000000000, 0.75],
    [0b0011010000000000, 0.25],
    [0b0011000000000000, 0.125],
  ];

  const buffer = new ArrayBuffer(2);
  const view = new DataView(buffer);

  for (const [bin, f16] of data) for (const LE of [false, true]) {
    view.setUint16(0, bin, LE);
    assert.same(view.getFloat16(0, LE), f16, `DataView.prototype.setUint16 + DataView.prototype.getFloat16, LE: ${ LE }, ${ toString(bin) } -> ${ toString(f16) }`);
    view.setFloat16(0, f16, LE);
    assert.same(view.getUint16(0, LE), bin, `DataView.prototype.setFloat16 + DataView.prototype.getUint16, LE: ${ LE }, ${ toString(f16) } -> ${ toString(bin) }`);
    assert.same(view.getFloat16(0, LE), f16, `DataView.prototype.setFloat16 + DataView.prototype.getFloat16, LE: ${ LE }, ${ toString(f16) }`);
  }

  const MAX_FLOAT16 = 65504;
  const MIN_FLOAT16 = 2 ** -24;

  const conversions = [
    [1.337, 1.3369140625],
    [0.499994, 0.5],
    [7.9999999, 8],
    [MAX_FLOAT16, MAX_FLOAT16],
    [-MAX_FLOAT16, -MAX_FLOAT16],
    [MIN_FLOAT16, MIN_FLOAT16],
    [-MIN_FLOAT16, -MIN_FLOAT16],
    [MIN_FLOAT16 / 2, 0],
    [-MIN_FLOAT16 / 2, -0],
    [2.980232238769531911744490042422139897126953655970282852649688720703125e-8, MIN_FLOAT16],
    [-2.980232238769531911744490042422139897126953655970282852649688720703125e-8, -MIN_FLOAT16],
    // normal values in (0, 1) — regression test for floor vs truncation of log2
    [0.3, 0.300048828125],
    [0.7, 0.7001953125],
    [-0.3, -0.300048828125],
    [-0.7, -0.7001953125],
  ];

  for (const [from, to] of conversions) for (const LE of [false, true]) {
    view.setFloat16(0, from, LE);
    assert.same(view.getFloat16(0, LE), to, `DataView.prototype.setFloat16 + DataView.prototype.getFloat16, LE: ${ LE }, ${ toString(from) } -> ${ toString(to) }`);
  }
});
