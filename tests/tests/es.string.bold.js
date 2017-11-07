var test = QUnit.test;

test('String#bold', function (assert) {
  var bold = String.prototype.bold;
  assert.isFunction(bold);
  assert.arity(bold, 0);
  assert.name(bold, 'bold');
  assert.looksNative(bold);
  assert.nonEnumerable(String.prototype, 'bold');
  assert.same('a'.bold(), '<b>a</b>', 'lower case');
});
