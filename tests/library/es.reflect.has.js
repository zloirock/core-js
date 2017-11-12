QUnit.test('Reflect.has', function (assert) {
  var has = core.Reflect.has;
  assert.isFunction(has);
  assert.arity(has, 2);
  if ('name' in has) {
    assert.name(has, 'has');
  }
  var object = { qux: 987 };
  assert.strictEqual(has(object, 'qux'), true);
  assert.strictEqual(has(object, 'qwe'), false);
  assert.strictEqual(has(object, 'toString'), true);
  assert['throws'](function () {
    has(42, 'constructor');
  }, TypeError, 'throws on primitive');
});
