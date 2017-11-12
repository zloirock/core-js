QUnit.test('String#big', function (assert) {
  var big = core.String.big;
  assert.isFunction(big);
  assert.same(big('a'), '<big>a</big>', 'lower case');
});
