QUnit.test('global', function (assert) {
  assert.same(global, Object(global), 'is object');
  assert.same(global.Math, Math, 'contains globals');
});
