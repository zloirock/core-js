QUnit.test('global', assert => {
  const { global } = core;
  assert.same(global, Object(global), 'is object');
  assert.same(global.Math, Math, 'contains globals');
});
