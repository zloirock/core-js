QUnit.test('Date#toString', function (assert) {
  var toString = Date.prototype.toString;
  assert.isFunction(toString);
  assert.arity(toString, 0);
  assert.name(toString, 'toString');
  assert.looksNative(toString);
  assert.nonEnumerable(Date.prototype, 'toString');
  assert.same(String(new Date(NaN)), 'Invalid Date');
});
