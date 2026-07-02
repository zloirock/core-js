import has from '@core-js/pure/es/reflect/has';

QUnit.test('Reflect.has', assert => {
  assert.isFunction(has);
  assert.arity(has, 2);
  if ('name' in has) {
    assert.name(has, 'has');
  }
  const object = { qux: 987 };
  assert.true(has(object, 'qux'));
  assert.false(has(object, 'qwe'));
  assert.true(has(object, 'toString'));
  assert.throws(() => has(42, 'constructor'), TypeError, 'throws on primitive');
});
