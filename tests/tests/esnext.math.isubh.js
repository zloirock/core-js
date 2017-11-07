var test = QUnit.test;

test('Math.isubh', function (assert) {
  var isubh = Math.isubh;
  assert.isFunction(isubh);
  assert.name(isubh, 'isubh');
  assert.arity(isubh, 4);
  assert.looksNative(isubh);
  assert.nonEnumerable(Math, 'isubh');
  assert.same(isubh(0, 2, 1, 0), 1);
  assert.same(isubh(0, 4, 1, 1), 2);
  assert.same(isubh(2, 4, 1, 1), 3);
  assert.same(isubh(0xffffffff, 4, 1, 1), 3);
  assert.same(isubh(1, 4, 0xffffffff, 1), 2);
});
