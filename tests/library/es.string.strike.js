QUnit.test('String#strike', function (assert) {
  var strike = core.String.strike;
  assert.isFunction(strike);
  assert.same(strike('a'), '<strike>a</strike>', 'lower case');
});
