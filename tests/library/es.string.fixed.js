QUnit.test('String#fixed', function (assert) {
  var fixed = core.String.fixed;
  assert.isFunction(fixed);
  assert.same(fixed('a'), '<tt>a</tt>', 'lower case');
});
