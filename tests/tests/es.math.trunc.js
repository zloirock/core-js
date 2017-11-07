var test = QUnit.test;

test('Math.trunc', function (assert) {
  var trunc = Math.trunc;
  assert.isFunction(trunc);
  assert.name(trunc, 'trunc');
  assert.arity(trunc, 1);
  assert.looksNative(trunc);
  assert.nonEnumerable(Math, 'trunc');
  assert.same(trunc(NaN), NaN, 'NaN -> NaN');
  assert.same(trunc(-0), -0, '-0 -> -0');
  assert.same(trunc(0), 0, '0 -> 0');
  assert.same(trunc(Infinity), Infinity, 'Infinity -> Infinity');
  assert.same(trunc(-Infinity), -Infinity, '-Infinity -> -Infinity');
  assert.same(trunc(null), 0, 'null -> 0');
  assert.same(trunc({}), NaN, '{} -> NaN');
  assert.strictEqual(trunc([]), 0, '[] -> 0');
  assert.strictEqual(trunc(1.01), 1, '1.01 -> 0');
  assert.strictEqual(trunc(1.99), 1, '1.99 -> 0');
  assert.strictEqual(trunc(-1), -1, '-1 -> -1');
  assert.strictEqual(trunc(-1.99), -1, '-1.99 -> -1');
  assert.strictEqual(trunc(-555.555), -555, '-555.555 -> -555');
  assert.strictEqual(trunc(0x20000000000001), 0x20000000000001, '0x20000000000001 -> 0x20000000000001');
  assert.strictEqual(trunc(-0x20000000000001), -0x20000000000001, '-0x20000000000001 -> -0x20000000000001');
});
