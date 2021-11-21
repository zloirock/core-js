QUnit.test('Reflect.has', assert => {
  const { has } = Reflect;
  assert.isFunction(has);
  assert.arity(has, 2);
  assert.name(has, 'has');
  assert.looksNative(has);
  assert.nonEnumerable(Reflect, 'has');
  const object = { qux: 987 };
  assert.true(has(object, 'qux'));
  assert.false(has(object, 'qwe'));
  assert.true(has(object, 'toString'));
  assert.throws(() => has(42, 'constructor'), TypeError, 'throws on primitive');
});
