QUnit.test('Reflect.has', function (assert) {
  var has = Reflect.has;
  assert.isFunction(has);
  assert.arity(has, 2);
  assert.name(has, 'has');
  assert.looksNative(has);
  assert.nonEnumerable(Reflect, 'has');
  var object = { qux: 987 };
  assert.strictEqual(has(object, 'qux'), true);
  assert.strictEqual(has(object, 'qwe'), false);
  assert.strictEqual(has(object, 'toString'), true);
  assert['throws'](function () {
    has(42, 'constructor');
  }, TypeError, 'throws on primitive');
});
