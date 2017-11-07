var test = QUnit.test;

test('String#fixed', function (assert) {
  var fixed = String.prototype.fixed;
  assert.isFunction(fixed);
  assert.arity(fixed, 0);
  assert.name(fixed, 'fixed');
  assert.looksNative(fixed);
  assert.nonEnumerable(String.prototype, 'fixed');
  assert.same('a'.fixed(), '<tt>a</tt>', 'lower case');
});
