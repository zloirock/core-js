QUnit.test('global', function (assert) {
  var global = core.global;
  assert.same(global, Object(global), 'is object');
  assert.same(global.Math, Math, 'contains globals');
});
