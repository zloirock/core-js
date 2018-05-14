import fround from 'core-js-pure/features/math/fround';

QUnit.test('Math.fround', assert => {
  assert.isFunction(fround);
  assert.same(fround(undefined), NaN);
  assert.same(fround(NaN), NaN);
  assert.same(fround(0), 0);
  assert.same(fround(-0), -0);
  assert.same(fround(Number.MIN_VALUE), 0);
  assert.same(fround(-Number.MIN_VALUE), -0);
  assert.strictEqual(fround(Infinity), Infinity);
  assert.strictEqual(fround(-Infinity), -Infinity);
  assert.strictEqual(fround(1.7976931348623157e+308), Infinity);
  assert.strictEqual(fround(-1.7976931348623157e+308), -Infinity);
  assert.strictEqual(fround(3.4028235677973366e+38), Infinity);
  assert.strictEqual(fround(3), 3);
  assert.strictEqual(fround(-3), -3);
  const maxFloat32 = 3.4028234663852886e+38;
  const minFloat32 = 1.401298464324817e-45;
  assert.strictEqual(fround(maxFloat32), maxFloat32);
  assert.strictEqual(fround(-maxFloat32), -maxFloat32);
  assert.strictEqual(fround(maxFloat32 + 2 ** 102), maxFloat32);
  assert.strictEqual(fround(minFloat32), minFloat32);
  assert.strictEqual(fround(-minFloat32), -minFloat32);
  assert.same(fround(minFloat32 / 2), 0);
  assert.same(fround(-minFloat32 / 2), -0);
  assert.strictEqual(fround(minFloat32 / 2 + 2 ** -202), minFloat32);
  assert.strictEqual(fround(-minFloat32 / 2 - 2 ** -202), -minFloat32);
});
