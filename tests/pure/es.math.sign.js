import sign from '../../packages/core-js-pure/fn/math/sign';

QUnit.test('Math.sign', assert => {
  assert.isFunction(sign);
  assert.same(sign(NaN), NaN);
  assert.same(sign(), NaN);
  assert.same(sign(-0), -0);
  assert.same(sign(0), 0);
  assert.strictEqual(sign(Infinity), 1);
  assert.strictEqual(sign(-Infinity), -1);
  assert.strictEqual(sign(13510798882111488), 1);
  assert.strictEqual(sign(-13510798882111488), -1);
  assert.strictEqual(sign(42.5), 1);
  assert.strictEqual(sign(-42.5), -1);
});
