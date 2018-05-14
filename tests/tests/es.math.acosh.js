QUnit.test('Math.acosh', assert => {
  const { acosh } = Math;
  assert.isFunction(acosh);
  assert.name(acosh, 'acosh');
  assert.arity(acosh, 1);
  assert.looksNative(acosh);
  assert.nonEnumerable(Math, 'acosh');
  assert.same(acosh(NaN), NaN);
  assert.same(acosh(0.5), NaN);
  assert.same(acosh(-1), NaN);
  assert.same(acosh(-1e300), NaN);
  assert.same(acosh(1), 0);
  assert.strictEqual(acosh(Infinity), Infinity);
  assert.epsilon(acosh(1234), 7.811163220849231);
  assert.epsilon(acosh(8.88), 2.8737631531629235);
  assert.epsilon(acosh(1e+160), 369.10676205960726);
  assert.epsilon(acosh(Number.MAX_VALUE), 710.475860073944);
  assert.epsilon(acosh(1 + Number.EPSILON), 2.1073424255447017e-8);
});
