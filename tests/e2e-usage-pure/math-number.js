// Math and Number static methods
QUnit.test('Math.sign', assert => {
  assert.same(Math.sign(5), 1);
  assert.same(Math.sign(-5), -1);
  assert.same(Math.sign(0), 0);
});

QUnit.test('Math.cbrt', assert => {
  assert.same(Math.cbrt(27), 3);
  assert.same(Math.cbrt(-8), -2);
});

QUnit.test('Math.log2', assert => {
  assert.same(Math.log2(8), 3);
  assert.same(Math.log2(1), 0);
});

QUnit.test('Math.clz32', assert => {
  assert.same(Math.clz32(1), 31);
  assert.same(Math.clz32(0), 32);
});

QUnit.test('Math.fround', assert => {
  assert.same(Math.fround(1.5), 1.5);
});

QUnit.test('Math.hypot', assert => {
  assert.same(Math.hypot(3, 4), 5);
});

QUnit.test('Number.isInteger', assert => {
  assert.true(Number.isInteger(1));
  assert.true(Number.isInteger(-100));
  assert.false(Number.isInteger(1.5));
  assert.false(Number.isInteger('1'));
});

QUnit.test('Number.isSafeInteger', assert => {
  assert.true(Number.isSafeInteger(42));
  assert.false(Number.isSafeInteger(Number.MAX_SAFE_INTEGER + 1));
});

QUnit.test('Number.parseInt / Number.parseFloat', assert => {
  assert.same(Number.parseInt('42px', 10), 42);
  assert.same(Number.parseFloat('3.14abc'), 3.14);
});

QUnit.test('Number.EPSILON', assert => {
  assert.same(typeof Number.EPSILON, 'number');
  assert.true(Number.EPSILON > 0);
  assert.true(Number.EPSILON < 1);
});

QUnit.test('Number.MIN_SAFE_INTEGER', assert => {
  assert.same(typeof Number.MIN_SAFE_INTEGER, 'number');
  assert.true(Number.MIN_SAFE_INTEGER < 0);
});

QUnit.test('Math.acosh', assert => {
  assert.same(Math.acosh(1), 0);
});

QUnit.test('Math.imul', assert => {
  assert.same(Math.imul(2, 3), 6);
});

QUnit.test('Math.log10', assert => {
  assert.same(Math.log10(100), 2);
});

QUnit.test('Math.cosh', assert => {
  assert.same(Math.cosh(0), 1);
});

QUnit.test('Math.tanh', assert => {
  assert.same(Math.tanh(0), 0);
});
