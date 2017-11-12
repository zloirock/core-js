QUnit.test('String#italics', function (assert) {
  var italics = core.String.italics;
  assert.isFunction(italics);
  assert.same(italics('a'), '<i>a</i>', 'lower case');
});
