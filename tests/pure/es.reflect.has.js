import has from '../../packages/core-js-pure/fn/reflect/has';

QUnit.test('Reflect.has', assert => {
  assert.isFunction(has);
  assert.arity(has, 2);
  if ('name' in has) {
    assert.name(has, 'has');
  }
  const object = { qux: 987 };
  assert.strictEqual(has(object, 'qux'), true);
  assert.strictEqual(has(object, 'qwe'), false);
  assert.strictEqual(has(object, 'toString'), true);
  assert.throws(() => has(42, 'constructor'), TypeError, 'throws on primitive');
});
