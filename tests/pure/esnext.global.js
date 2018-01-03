import global from 'core-js-pure/fn/global';

QUnit.test('global', assert => {
  assert.same(global, Object(global), 'is object');
  assert.same(global.Math, Math, 'contains globals');
});
