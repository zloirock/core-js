QUnit.test('String#italics', function (assert) {
  var italics = String.prototype.italics;
  assert.isFunction(italics);
  assert.arity(italics, 0);
  assert.name(italics, 'italics');
  assert.looksNative(italics);
  assert.nonEnumerable(String.prototype, 'italics');
  assert.same('a'.italics(), '<i>a</i>', 'lower case');
});
