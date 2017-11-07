var test = QUnit.test;

test('Math.umulh', function (assert) {
  var umulh = Math.umulh;
  assert.isFunction(umulh);
  assert.name(umulh, 'umulh');
  assert.arity(umulh, 2);
  assert.looksNative(umulh);
  assert.nonEnumerable(Math, 'umulh');
  assert.same(umulh(0xffffffff, 7), 6);
  assert.same(umulh(0xfffffff, 77), 4);
  assert.same(umulh(1, 7), 0);
  assert.same(umulh(-1, 7), 6);
});
