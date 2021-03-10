import signbit from 'core-js-pure/full/math/signbit';

QUnit.test('Math.signbit', assert => {
  assert.isFunction(signbit);
  assert.strictEqual(signbit(NaN), false);
  assert.strictEqual(signbit(), false);
  assert.strictEqual(signbit(-0), true);
  assert.strictEqual(signbit(0), false);
  assert.strictEqual(signbit(Infinity), false);
  assert.strictEqual(signbit(-Infinity), true);
  assert.strictEqual(signbit(13510798882111488), false);
  assert.strictEqual(signbit(-13510798882111488), true);
  assert.strictEqual(signbit(42.5), false);
  assert.strictEqual(signbit(-42.5), true);
});
