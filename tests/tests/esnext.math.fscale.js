var test = QUnit.test;

test('Math.fscale', function (assert) {
  var fscale = Math.fscale;
  var fround = Math.fround;
  var PI = Math.PI;
  assert.isFunction(fscale);
  assert.name(fscale, 'fscale');
  assert.arity(fscale, 5);
  assert.looksNative(fscale);
  assert.nonEnumerable(Math, 'fscale');
  assert.same(fscale(3, 1, 2, 1, 2), 3);
  assert.same(fscale(0, 3, 5, 8, 10), 5);
  assert.same(fscale(1, 1, 1, 1, 1), NaN);
  assert.same(fscale(-1, -1, -1, -1, -1), NaN);
  assert.strictEqual(fscale(3, 1, 2, 1, PI), fround((3 - 1) * (PI - 1) / (2 - 1) + 1));
});
