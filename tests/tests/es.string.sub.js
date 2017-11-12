QUnit.test('String#sub', function (assert) {
  var sub = String.prototype.sub;
  assert.isFunction(sub);
  assert.arity(sub, 0);
  assert.name(sub, 'sub');
  assert.looksNative(sub);
  assert.nonEnumerable(String.prototype, 'sub');
  assert.same('a'.sub(), '<sub>a</sub>', 'lower case');
});
