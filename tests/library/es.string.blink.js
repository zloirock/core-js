var test = QUnit.test;

test('String#blink', function (assert) {
  var blink = core.String.blink;
  assert.isFunction(blink);
  assert.same(blink('a'), '<blink>a</blink>', 'lower case');
});
