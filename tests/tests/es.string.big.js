var test = QUnit.test;

test('String#big', function (assert) {
  var big = String.prototype.big;
  assert.isFunction(big);
  assert.arity(big, 0);
  assert.name(big, 'big');
  assert.looksNative(big);
  assert.nonEnumerable(String.prototype, 'big');
  assert.same('a'.big(), '<big>a</big>', 'lower case');
});
