import global from 'core-js-pure/features/global';

QUnit.test('global', assert => {
  assert.same(global, Object(global), 'is object');
  assert.same(global.Math, Math, 'contains globals');
});
