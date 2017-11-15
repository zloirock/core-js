QUnit.test('Reflect.has', assert => {
  const { has } = Reflect;
  assert.isFunction(has);
  assert.arity(has, 2);
  assert.name(has, 'has');
  assert.looksNative(has);
  assert.nonEnumerable(Reflect, 'has');
  const object = { qux: 987 };
  assert.strictEqual(has(object, 'qux'), true);
  assert.strictEqual(has(object, 'qwe'), false);
  assert.strictEqual(has(object, 'toString'), true);
  assert.throws(() => {
    return has(42, 'constructor');
  }, TypeError, 'throws on primitive');
});
