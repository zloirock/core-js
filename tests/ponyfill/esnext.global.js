import global from '../../ponyfill/fn/global';

QUnit.test('global', assert => {
  assert.same(global, Object(global), 'is object');
  assert.same(global.Math, Math, 'contains globals');
});
