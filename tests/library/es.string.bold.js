QUnit.test('String#bold', function (assert) {
  var bold = core.String.bold;
  assert.isFunction(bold);
  assert.same(bold('a'), '<b>a</b>', 'lower case');
});
