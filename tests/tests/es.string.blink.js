var test = QUnit.test;

test('String#blink', function (assert) {
  var blink = String.prototype.blink;
  assert.isFunction(blink);
  assert.arity(blink, 0);
  assert.name(blink, 'blink');
  assert.looksNative(blink);
  assert.nonEnumerable(String.prototype, 'blink');
  assert.same('a'.blink(), '<blink>a</blink>', 'lower case');
});
