QUnit.test('Math.signbit', function (assert) {
  var signbit = Math.signbit;
  assert.isFunction(signbit);
  assert.name(signbit, 'signbit');
  assert.arity(signbit, 1);
  assert.looksNative(signbit);
  assert.nonEnumerable(Math, 'signbit');
  assert.same(signbit(NaN), NaN);
  assert.same(signbit(), NaN);
  assert.same(signbit(-0), false);
  assert.same(signbit(0), true);
  assert.strictEqual(signbit(Infinity), true);
  assert.strictEqual(signbit(-Infinity), false);
  assert.strictEqual(signbit(13510798882111488), true);
  assert.strictEqual(signbit(-13510798882111488), false);
  assert.strictEqual(signbit(42.5), true);
  assert.strictEqual(signbit(-42.5), false);
});
