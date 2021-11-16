import has from 'core-js-pure/features/reflect/has';

QUnit.test('Reflect.has', assert => {
  assert.isFunction(has);
  assert.arity(has, 2);
  if ('name' in has) {
    assert.name(has, 'has');
  }
  const object = { qux: 987 };
  assert.same(true, has(object, 'qux'));
  assert.same(false, has(object, 'qwe'));
  assert.same(true, has(object, 'toString'));
  assert.throws(() => has(42, 'constructor'), TypeError, 'throws on primitive');
});
